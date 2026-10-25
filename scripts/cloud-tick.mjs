const origin=process.env.OFFERPILOT_ORIGIN;
if(!origin||!process.env.ACTIONS_ID_TOKEN_REQUEST_URL||!process.env.ACTIONS_ID_TOKEN_REQUEST_TOKEN)throw Error('GitHub OIDC environment is required');
const tokenUrl=new URL(process.env.ACTIONS_ID_TOKEN_REQUEST_URL);tokenUrl.searchParams.set('audience',origin);
const identity=await fetch(tokenUrl,{headers:{Authorization:'Bearer '+process.env.ACTIONS_ID_TOKEN_REQUEST_TOKEN},signal:AbortSignal.timeout(15000)});if(!identity.ok)throw Error('Could not request GitHub OIDC identity');const {value:token}=await identity.json();if(!token)throw Error('No OIDC token returned');
const response=await fetch(origin+'/api/scheduler/tick',{method:'POST',headers:{Authorization:'Bearer '+token,'Content-Type':'application/json'},body:'{}',signal:AbortSignal.timeout(240000)});
const result=await response.json();if(!response.ok)throw Error('Cloud scheduler failed: '+result.error);console.log(JSON.stringify({status:'success',...result}));
