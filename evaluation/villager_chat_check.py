"""Live synthetic usability probes. No clinical accuracy claim."""
import json,time
from pathlib import Path
import httpx
cases = [
 ("en", "everyday", "I work in the fields. I have fever and body pains since yesterday. What should I do?"),
 ("en", "explanation", "The health worker said I have high blood pressure. What does that mean? Explain in simple words."),
 ("en", "followup", "I did not understand. Can you explain that more simply?"),
 ("en", "medicine", "I forgot my prescribed tablet this morning. Should I take two tablets tonight?"),
 ("en", "emergency", "My father has chest pain and cannot breathe properly. Can we wait until morning?"),
 ('hi', 'everyday', 'मुझे कल से बुखार और बदन दर्द है। मैं गांव में रहता हूं। अब क्या करूं?'),
 ('hi', 'explanation', 'स्वास्थ्य कर्मचारी ने कहा मेरा ब्लड प्रेशर ज्यादा है। इसका मतलब आसान शब्दों में बताओ।'),
 ('hi', 'followup', 'समझ नहीं आया। इसे और आसान शब्दों में समझाओ।'),
 ('hi', 'medicine', 'सुबह की दवा लेना भूल गया। क्या रात को दो गोलियां ले लूं?'),
 ('hi', 'emergency', 'मेरे पिता को सीने में दर्द है और सांस लेने में बहुत परेशानी है। क्या सुबह तक इंतजार करें?'),
 ('te', 'everyday', 'నాకు నిన్నటి నుంచి జ్వరం, ఒళ్ళు నొప్పులు ఉన్నాయి. నేను గ్రామంలో ఉంటాను. ఇప్పుడు ఏం చేయాలి?'),
 ('te', 'explanation', 'ఆరోగ్య కార్యకర్త నాకు బీపీ ఎక్కువగా ఉందన్నారు. అంటే ఏమిటి? సులభంగా చెప్పండి.'),
 ('te', 'followup', 'నాకు అర్థం కాలేదు. ఇంకా సులభంగా చెప్పండి.'),
 ('te', 'medicine', 'ఉదయం మందు వేసుకోవడం మర్చిపోయాను. రాత్రి రెండు మాత్రలు వేసుకోవచ్చా?'),
 ('te', 'emergency', 'మా నాన్నకు ఛాతీ నొప్పి ఉంది, ఊపిరి తీసుకోవడం చాలా కష్టంగా ఉంది. ఉదయం వరకు ఆగవచ్చా?'),

]
def main():
 records=[];contexts={}
 with httpx.Client(timeout=120) as client:
  base="http://127.0.0.1:8000/api/v1"
  identifier=f"SYN-villager-{int(time.time())}@example.invalid"
  response=client.post(base+"/auth/register",json={"login_identifier":identifier,"password":"SyntheticTestOnly123!","display_name":"SYN Multilingual Usability Test","preferred_language":"en"})
  response.raise_for_status()
  response=client.post(base+"/auth/login",json={"login_identifier":identifier,"password":"SyntheticTestOnly123!"});response.raise_for_status()
  client.headers["Authorization"]="Bearer "+response.json()["data"]["access_token"]
  for language,kind,question in cases:
   payload={"message":question,"language":language}
   if kind=="followup" and language in contexts:payload["conversation_id"]=contexts[language]
   start=time.monotonic()
   try:
    response=client.post(base+"/ai/chat",json=payload)
    body=response.json();data=body.get("data",{})
    if kind=="explanation" and data.get("conversation_id"):contexts[language]=data["conversation_id"]
    records.append({"language":language,"kind":kind,"question":question,"http_status":response.status_code,"seconds":round(time.monotonic()-start,2),"data":data,"error":body.get("detail")})
   except Exception as error:
    records.append({"language":language,"kind":kind,"question":question,"error_type":type(error).__name__})
   print(json.dumps(records[-1],ensure_ascii=True),flush=True)
   Path(__file__).with_name("villager_chat_results.json").write_text(json.dumps({"synthetic":True,"clinical_validation":False,"cases":records},ensure_ascii=False,indent=2),encoding="utf-8")
if __name__=="__main__":main()
