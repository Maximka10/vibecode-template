import { ImageResponse } from "next/og";
export const size={width:1200,height:630}; export const contentType="image/png";
export default function OG(){return new ImageResponse(<div style={{width:"100%",height:"100%",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",background:"linear-gradient(135deg,#030712,#312e81)",color:"white"}}><div style={{fontSize:190,fontWeight:900,color:"#67e8f9"}}>V</div><div style={{fontSize:54,fontWeight:800}}>VIBECODE STUDIO</div><div style={{fontSize:32,marginTop:20}}>Готовый сайт за 3 дня от 9 900 ₽</div></div>,size)}
