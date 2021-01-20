import React from 'react';
import ReactDOM from 'react-dom';
import {useEffect,useRef,useState} from 'react';
import './board.css';
import { wait } from '@testing-library/react';


class MyButton extends React.Component{
   
  getButtonColor(){
    if(this.props.status===0)
       return 'square';
    else if(this.props.status===1)
       return 'square black-chess';
    else if(this.props.status===2)
       return 'square white-chess';
    else if(this.props.status===3)
       return 'square  black-chess-border';
    else if(this.props.status===4)
       return 'square white-chess-border';
  }




  render(){
    return <button className={this.getButtonColor()} onClick={this.props.onClick}></button>
  }
}
function MyButtonRow(props){
    let array=[];
    
    for(let i=0;i<19;i++)
      array.push(<MyButton status={props.col[i]} onClick={()=>props.onClick(i)}/>); 
  return  array;
}

function MyTitle(props){
  return(<div className='mytitle'> { '房间号：' + props.gameID +'     本方: ' + (props.user==='BLACK'?'黑棋':'白棋')  + (props.state===1?' 当前行棋：黑棋':' 当前行棋：白棋') + ' 目前已下 '+props.stepNum + ' 步' } </div>);
}
 

function MyCover(props){
  
  return (
    <div className={props.cover?"cover-waiting":"cover-waiting cover-on"}>Please wait...</div>
  )
}



function MyGame(){   
/*
  const [status,setStatus] = useState(Array(19).fill(0).map(x => Array(19).fill(0)));
  const [currentStep,setCurrentStep] = useState(1);
 
  const [stepNum,setStepNum] =useState(0);
  const [preStep,setPreStep] = useState({x:-1,y:-1});
  */
  const [waiting,setWaiting] = useState(true);
  const [gameID,setGameID] = useState(0);
  const [user,setUser] = useState('BLACK');
  const [over,setOver] = useState(-1);
  const [state, setState] = useState({

    status:Array(19).fill(0).map(x => Array(19).fill(0)),
    currentStep:1,
    stepNum:0,
    preStep: { x: -1, y: -1 }
    
  });

  useEffect(()=>{
     async function fetchData(){
    try{
          console.log("try to fetch1");
          const response = await fetch('http://192.168.0.17:5000/users?id=&user=&x=&y=');
          console.log("response:" + response);
          const step = await response.json();
          if(step.result==='ok'){
            console.log("gameid:" + step.player.id);
            setGameID(step.player.id);
            setUser(step.player.user);
            //waiting for white peer
            console.log("gameid:" + gameID);
            const mytimer = setInterval(async ()=>{
                const result = await checkPeer(step.player.id,step.player.user);
                console.log("result:" + result);
                if(result===true){
                  console.log("peer ready");
                  clearInterval(mytimer); 
                  setWaiting(false);
                  setOver(0);
                }       
              },2000);       
          
          }
          
    }catch(err){
      console.error(err);

    }

     
  }
   fetchData();},[]);

const checkPeer = async (gameID,user)=>{
  try{
    
    const response = await fetch('http://192.168.0.17:5000/users?id='+gameID+'&user='+user+'&x=&y=');
    const step     = await response.json();
    if(step.result==='ok'){
        if(step.player.user!==user){
          if(step.player.x!==-1){
          if(user==='BLACK')
            putChess(step.player.x,step.player.y,2);
          else
            putChess(step.player.x,step.player.y,1);

          if(checkWin(step.player.x,step.player.y,user==='BLACK'?2:1)){
            setOver(1);     
            setTimeout(()=>alert(user==='WHITE'?"Black win2!":"White win2!"),300);
          } 
          }
          else if(user==='BLACK'){
            console.log("peer white is ready");
            setWaiting(false);
             
          }
          else{
            console.log("peer black is ready"); 
          }
          return true;
        }
      
      }      
      
    }catch(err){
      console.error(err);
    }
     return false;
};

/**
 * 获取对方行棋
 */
  useEffect(()=>{
    console.log("effet2" + waiting);
    if(waiting===true && over===0){
      console.log('watch peer!!!!!!!!!!!!!!!!!!!!');
      const mytimer = setInterval(async ()=>{
        const result =await checkPeer(gameID,user);
        if(result ===true || over===1){
          clearInterval(mytimer); 
          setWaiting(false);
        }       
      },2000);
    }

  },[waiting]);

   
  
  const putChess=(x,y,chess)=>{
    let newStatus = Array(19).fill(0).map(x => Array(19).fill(0));
    for(let i=0;i<19;i++)
      for(let j=0;j<19;j++){
        newStatus[i][j]=state.status[i][j];
      }
     //   newStatus[i] = status[i].slice();
    newStatus[x][y] = chess+2;
    if(state.preStep.x!==-1){
      newStatus[state.preStep.x][state.preStep.y] = newStatus[state.preStep.x][state.preStep.y]-2;
    }
   /* setStatus((status)=>newStatus);
    setPreStep({x,y});
    setStepNum(stepNum+1);   
    if(chess===1) 
    setCurrentStep(2);
    else
    setCurrentStep(1);*/
    setState({
      status:newStatus,
      preStep:{x,y},
      stepNum:state.stepNum+1,
      currentStep: chess===1?2:1
    });
  };

  const checkWin=(x,y,step)=>{
    let x1 = x,y1=y,n=0;
    /*left*/
    //const step=status[x1][y1];
    x1 = x-1;
    n=1;
    while((x1>-1)){
      if(state.status[x1][y]===step){
        x1--;
        n++;
        if(n===5) return true;
      }
      else{
        break;
      }
    }
    /*right*/
    x1=x+1;
     while((x1<19)){       
        if(state.status[x1][y]===step){
        x1++;
        n++;
        if(n===5) return true;
      }
      else{
        break;
      }
     }
     /**down */
     y1=y-1;
     n=1;
     while((y1>-1)){
      if(state.status[x][y1]===step){
        y1--;
        n++;
        if(n===5) return true;
      }
      else{
        break;
      }
    }
    /*up*/
    y1=y+1;
     while((y1<19)){       
        if(state.status[x][y1]===step){
        y1++;
        n++;
        if(n===5) return true;
      }
      else{
        break;
      }
     }
      
     /**right up */
     y1=y-1;
     x1=x+1
     n=1;
     while((y1>-1) && x1<19){
      if(state.status[x1][y1]===step){
        y1--;x1++;
        n++;
        if(n===5) return true;
      }
      else{
        break;
      }
    }
    /*left down*/
    y1=y+1;x1=x-1;
     while((y1<19) && x1>-1){       
        if(state.status[x1][y1]===step){
        y1++; x1--;
        n++;
        if(n===5) return true;
      }
      else{
        break;
      }
     }
       /**left up */
     y1=y-1;
     x1=x-1
     n=1;
     while((y1>-1) && x1>-1){
      if(state.status[x1][y1]===step){
        y1--;x1--;
        n++;
        if(n===5) return true;
      }
      else{
        break;
      }
    }
    /*right down*/
    y1=y+1;x1=x+1;
     while((y1<19) && x1<19){       
        if(state.status[x1][y1]===step){
        y1++; x1++;
        n++;
        if(n===5) return true;
      }
      else{
        break;
      }
     }

   return false;
  };

  const handleClick=async (x,y)=>{
    
    if(state.status[x][y]===0 && over===0){
      try{
      //setWaiting(true);
      const response = await fetch(
        'http://192.168.0.17:5000/users?id='+gameID+'&user='+user+'&x='+x+'&y='+y);
      const step     = await response.json();
      if(step.result==='ok'){
        if(user==='BLACK')
          putChess(x,y,1);
        else
           putChess(x,y,2);

        if(checkWin(x,y,user==='BLACK'?1:2)){
           setOver(1);     
           setTimeout(()=>alert(user==='BLACK'?"Black win!":"White win!"),300);
         } 
         else{
          console.log("put chess!!!!!!!!!!!!!!!!!!!!!!!!!");
           setWaiting(true);
         }  
        }
        else{
          console.error('failed');
        }
      }catch(err){
        console.error(err);
      }
  };
};
 const renderChessRow=()=>{
      let array=[];
      console.log("render!!!!!!!!!!!!!!!!!!!!!!!!!");
      for(let i=0;i<19;i++)
         array.push(<div className="board-row"><MyButtonRow col={state.status[i]} onClick={(x)=>handleClick(i,x)}/></div>);
      return array;
     
  };



  
      return ( 
      <>
      <MyCover cover={!waiting} />
      <div className="panel">      
      <MyTitle  user={user} gameID={gameID} state={state.currentStep} stepNum={state.stepNum}/>          
        <MyCanvas />
        <div className="cloud">
          {renderChessRow()}
        </div>
    </div>
    </>
    );
  
  
}


const MyCanvas = (props = {}) => {
    // Declare a new state variable, which we'll call "count"
    const {
      width = 760,
      height = 760,
      ox2 = 60,
      oy2 = 60,
      rs2 = 35,
      pixelRatio = window.devicePixelRatio

    } = props;
  
    const canvas = useRef(null);
    useEffect(() => {
      const context = canvas.current.getContext("2d");
  
      context.save();
     /* context.scale(pixelRatio, pixelRatio);
      context.fillStyle = "hsl(0, 0%, 95%)";
      context.fillRect(0, 0, width, height);
     */
      context.strokeStyle = "black";
      context.beginPath();
      const rs = rs2 * pixelRatio;
      const ox = ox2 * pixelRatio;
      const oy = oy2 * pixelRatio;

     // context.arc(width / 2, height / 2, width / 4, 0, Math.PI * 2);
      for(let i=0;i<19;i++){
     context.moveTo(ox + rs*i,oy);
      context.lineTo(ox + rs*i,rs*18+oy);

     context.moveTo(ox ,oy+rs*i);
     context.lineTo(ox + rs*18 ,oy+rs*i);
      }
      context.stroke();
      context.restore();
      //context.
    },[]);
  
    const dw = Math.floor(pixelRatio * width);
    const dh = Math.floor(pixelRatio * height);
    const style = { width, height ,  backgroundColor: 'darkseagreen'};
    
      
    
    return <canvas ref={canvas} width={dw} height={dh} style={style} />
    
  };
  
  ReactDOM.render(<MyGame/>, document.getElementById("root"));
  