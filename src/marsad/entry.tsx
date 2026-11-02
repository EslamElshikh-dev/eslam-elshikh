import React from 'react';
import {createRoot} from 'react-dom/client';
import Casebook from './casebook';
import AccessForm from './access-form';
const element=document.getElementById('marsad-root');
if(element){const mode=document.body.dataset.marsadMode;const initialId=location.pathname.match(/^\/marsad\/cases\/([^/]+)/)?.[1]??null;createRoot(element).render(mode==='app'?<Casebook initialId={initialId}/>:<AccessForm setup={mode==='setup'}/>);}
