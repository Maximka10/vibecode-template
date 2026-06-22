-- Chat messages between clients and admins
CREATE TABLE IF NOT EXISTS messages (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id    uuid NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  sender_id   uuid REFERENCES auth.users(id),
  sender_role text NOT NULL CHECK (sender_role IN ('admin', 'client', 'system')),
  content     text NOT NULL,
  created_at  timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS messages_order_id_idx ON messages(order_id);
CREATE INDEX IF NOT EXISTS messages_created_at_idx ON messages(created_at);

ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Admins can read and write all messages
CREATE POLICY "admin_all_messages" ON messages
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.uid() = id
      AND raw_user_meta_data->>'role' = 'admin'
    )
  );

-- Clients can read messages on their own orders
CREATE POLICY "client_read_own_messages" ON messages
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = messages.order_id
      AND orders.user_id = auth.uid()
    )
  );

-- Clients can insert messages on their own orders
CREATE POLICY "client_insert_own_messages" ON messages
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = messages.order_id
      AND orders.user_id = auth.uid()
    )
  );
