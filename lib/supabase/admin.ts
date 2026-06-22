type DbError = { message: string } | null;
type DbResult = { data: any; error: DbError };

function makeQuery(): any {
  const result: DbResult = { data: null, error: null };
  const p = Promise.resolve(result);
  const q: any = {
    select(_s?: string) { return makeQuery(); },
    eq(_c: string, _v: string) { return makeQuery(); },
    single: async (): Promise<DbResult> => result,
    insert(_v: any) { return makeQuery(); },
    update(_v: any) { return makeQuery(); },
    order(_c: string, _opts?: { ascending?: boolean }) { return makeQuery(); },
    then: p.then.bind(p),
    catch: p.catch.bind(p),
    finally: p.finally.bind(p),
  };
  return q;
}

export function createAdminClient() {
  return {
    auth: {
      getUser: async (_token?: string): Promise<{ data: { user: { id: string } | null }; error: null }> =>
        ({ data: { user: null }, error: null }),
    },
    from: (_table: string) => makeQuery(),
  };
}
