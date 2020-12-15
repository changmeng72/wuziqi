import React from 'react';
import ReactDOM from 'react-dom';
import {useEffect,useRef} from 'react'
import './board.css'


class MyButton extends React.Component{
   
  getButtonColor(){
    if(this.props.status===0)
       return 'square';
    else if(this.props.status===1)
       return 'square' + ' black-chess';
    else if(this.props.status===2)
       return 'square' + ' white-chess';
    else if(this.props.status===3)
       return 'square' + ' black-chess-border'
    else if(this.props.status===4)
       return 'square' + ' white-chess-border';
  }
  render(){
    return <button className={this.getButtonColor()} onClick={this.props.onClick}></button>
  }
}
function MyButtonRow(props){
    let array=[];
    console.log("props:" + props.onClick);
    for(let i=0;i<19;i++)
      array.push(<MyButton status={props.col[i]} onClick={()=>props.onClick(i)}/>); 
  return  array;
}

function MyTitle(props){
  return(<p className='mytitle'> {(props.state==1?'当前行棋：黑棋':'当前行棋：白棋') + '     目前已下 '+props.stepNum + ' 步' } </p>);
}
 

class MyGame extends React.Component {   

  constructor(props){
    super(props);
    this.state={
      status:Array(19).fill(0).map(x => Array(19).fill(0)),
      currentStep:1,
      over:0,
      stepNum:0,
      preStep:{x:-1,y:-1}


    };
  }
   
  checkWin(x,y,step){
    let x1 = x,y1=y,n=0;
    /*left*/
    x1 = x-1;
    n=1;
    while((x1>-1)){
      if(this.state.status[x1][y]===step){
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
        if(this.state.status[x1][y]===step){
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
      if(this.state.status[x][y1]===step){
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
        if(this.state.status[x][y1]===step){
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
      if(this.state.status[x1][y1]===step){
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
        if(this.state.status[x1][y1]===step){
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
      if(this.state.status[x1][y1]===step){
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
        if(this.state.status[x1][y1]===step){
        y1++; x1++;
        n++;
        if(n===5) return true;
      }
      else{
        break;
      }
     }

   return false;
  }

  async handleClick(x,y){
    
    if(this.state.status[x][y]===0 && this.state.over===0){
      
      let newStatus = [];
      let newStep = this.state.currentStep;
      let over = 0;
      let stepNum = this.state.stepNum;
      let preStep = {x:-1,y:-1};
      for(let i=0;i<this.state.status.length;i++)
           newStatus = this.state.status.slice();
      
      newStatus[x][y] = this.state.currentStep + 2;
      if(this.state.preStep.x!==-1){
        newStatus[this.state.preStep.x][this.state.preStep.y] = 
        newStatus[this.state.preStep.x][this.state.preStep.y]-2;
      }
      preStep.x = x;
      preStep.y = y;
      stepNum++;
      if(this.state.currentStep===1){
        newStep = 2;
      }
      else{
        newStep = 1;
      }
      if(this.checkWin(x,y,this.state.currentStep)){
        over=1;        
      }

      await this.setState( {
         status:newStatus,
         currentStep:newStep,
         over:over,
         stepNum:stepNum,
         preStep:preStep

       }
      ); 
      if(over===1)
         setTimeout(()=>alert(this.state.currentStep===1?"Black win!":"White win!"),300);
    }

  }
   
  renderChessRow(){
      let array=[];
      
      for(let i=0;i<19;i++)
         array.push(<div className="board-row"><MyButtonRow col={this.state.status[i]} onClick={(x)=>this.handleClick(i,x)}/></div>);
      return array;
     
  }



  render(){
      return ( 
      <div className="panel">
      <MyTitle   state={this.state.currentStep} stepNum={this.state.stepNum}/>          
        <MyCanvas />
        <div className="cloud">
          {this.renderChessRow()}
        </div>
    </div>
    );
  }
  
}


const MyCanvas = (props = {}) => {
    // Declare a new state variable, which we'll call "count"
    const {
      width = 760,
      height = 760,
      ox = 60,
      oy = 60,
      rs = 35,
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
    const style = { width, height ,background:"brown"  };
    
      
    
    return <canvas ref={canvas} width={dw} height={dh} style={style} />
    
  };
  
  ReactDOM.render(<MyGame/>, document.getElementById("root"));
  