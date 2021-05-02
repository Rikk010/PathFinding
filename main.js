maingrid = document.getElementById("maingrid")
maintable = document.getElementById("maintable")
tbody = document.getElementById("tbody")
isMouseDown = false
filltype = 'wall'
allow_placement = true
solve_id = "1"
using_algorithm = "Dijkstra"





class Block{
    static allBlocks = {};
    constructor(type,element, x, y, gcost =0, hcost = 0, fcost= 0 ){
        this.type = type;
        this.element = element;
        this.x = x;
        this.y = y;     
        this.parent = null;  
        Block.allBlocks[x.toString() + "-" + y.toString()] = this;
        this.setType(type)

        //Variables for A*
        this.fcost = fcost
        this.hcost = hcost
        this.gcost = gcost
        
    }
    showCosts(){
        this.element.innerHTML = `<div class="text-primary small-text"> <b>${this.fcost.toString()}</b> <u>${this.gcost.toString()}</u> <i>${this.hcost}</i></div>`;
    }
    hideCosts(){
        this.element.innerHTML = ''
    }
    static resetParent(){
        this.GetAllBlocks().forEach(entry => {
            entry.parent = null;
        })
    }
    getAround(filter, with_diagonal){
        var currentblock = this;
        var final_blocks = [
            
            Block.getBlock(currentblock.x + 1, currentblock.y),
            Block.getBlock(currentblock.x - 1, currentblock.y),
            Block.getBlock(currentblock.x, currentblock.y + 1),
            Block.getBlock(currentblock.x, currentblock.y - 1)
        ]
        if(with_diagonal){
            final_blocks = final_blocks.concat([Block.getBlock(currentblock.x+1, currentblock.y + 1),
                Block.getBlock(currentblock.x-1, currentblock.y - 1),
                Block.getBlock(currentblock.x+1, currentblock.y - 1),
                Block.getBlock(currentblock.x-1, currentblock.y + 1)])
        }
                
        var final = final_blocks.filter(function (value, index, arr){
            
            return (value != null && !filter.includes(value.type));
        })
        return final
    }  

    setParent(parent){
        this.parent = parent;
    }
    niceName(){
        return this.x.toString() + "-" + this.y.toString()
    }


    
    static GetAllBlocks(){
        return Object.values(Block.allBlocks);
    }
    setType(newtype){
        this.type = newtype;
        this.element.classList = []
        this.element.classList.add(newtype)
        

        if (newtype == "start"){
            Grid.setStart(this)
        }
        if (newtype == "finish"){
            Grid.setFinish(this)
        }
        
    }


    static getBlock(x, y){
        return Block.allBlocks[x.toString() + "-" +y.toString()]
    }
    static getBlockByString(stringxy){
        return Block.allBlocks[stringxy]
    }
}

class Grid{
    static start = null;
    static finish = null;

    static setStart(block){
        Grid.start?.setType("empty")
       
        Grid.start = block;
        
    }
    static setFinish(block){
        
        Grid.finish?.setType("empty")
        
        
        Grid.finish = block;
        
        
    }

    static clearItems(toremove){
        Block.GetAllBlocks().forEach(entry => {
            if(entry.type==toremove){
                entry.setType("empty")
            }
        })
    }
    static clearText(){
        Block.GetAllBlocks().forEach(entry =>{
            entry.element.innerHTML = "";
        })
    }
    static setToFinished(toChange, delay, current_solve_id){
        setTimeout(()=>{
            if(current_solve_id == solve_id)
                toChange.setType("finalpath")
            }, delay)
    }
    static showFinalPath(end, inverse){
    
        var finalpaths = []
        var cur = end
        while(cur.parent != null){
            cur = cur.parent
            if (cur.type != 'start'){
                finalpaths.push(cur)
            }
        }
        if(inverse){
            finalpaths.reverse().forEach((value,index) => Grid.setToFinished(value, 80*index,solve_id))
        }
        else{
            finalpaths.forEach((value,index) => Grid.setToFinished(value, 80*index,solve_id))
        }
    }

}
function ClearGrid(){
    Block.resetParent()
    Grid.clearItems("visited")
    Grid.clearItems("finalpath")
    Grid.clearItems("closed")
    Grid.clearText();
}
function ResetGrid(){
    Block.resetParent()
    Block.GetAllBlocks().forEach(entry => entry.setType("empty"))
    Grid.start =null;
    Grid.finish = null;
    Grid.clearText();
}

function setFill(type){
    filltype= type;
}

function cellMouseDown(event){

    target = event.target
    
    if((isMouseDown || event.type=="click") && allow_placement){
        
        var x = Block.getBlockByString(target.id).setType(filltype)
     
           
    }
}
function ToggleAlgorithm(elem){
   elem.innerHTML = (elem.innerHTML == "Dijkstra" ? "A*" : "Dijkstra")
}
function generateGrid(width, height){
    for(h=0; h<height; h++){
        newRow = tbody.insertRow();
        for (w=0; w<width; w++){
            newCell = newRow.insertCell();
            newCell.id = w.toString() + "-" + h.toString();
           
            newCell.addEventListener("mouseover", cellMouseDown)
            newCell.addEventListener("click", cellMouseDown)
            var b =new Block("empty", newCell, w, h)
            
        }   
    }
}
function distance(x1, y1, x2, y2) {
    var dx = Math.abs(x2 - x1);
    var dy = Math.abs(y2 - y1);

    var min = Math.min(dx, dy);
    var max = Math.max(dx, dy);

    var diagonalSteps = min;
    var straightSteps = max - min;
    
    return Math.round(10*(Math.sqrt(2) * diagonalSteps + straightSteps));
}

class Dijkstra{
    static selected = []
  
    static new_selected = []
    static solved = false

    static count = 0;
    static SolveNext(){
        console.log(`solving for ${this.count}`)
        this.count ++
        Dijkstra.new_selected = []
        this.selected.forEach(entry => Dijkstra.Solve(entry))
        
        this.selected.forEach(origin =>  {
            
            var around = origin.getAround(["wall", "visited", "start"], false)
            
            around.forEach(around_item => {
                around_item.setParent(origin)
               
                if(!Dijkstra.new_selected.includes(around_item)){
                    Dijkstra.new_selected.push(around_item)
                }
            })  
        })
        Dijkstra.selected = Dijkstra.new_selected;
        

        
        
    }
    
    static Reset(){
        this.solved = false;
        this.selected = [Grid.start]
        this.new_selected = []
        
        Grid.clearItems("visited");
        Grid.clearItems("finalpath")
    }

    
    static setToFinished(toChange, delay, current_solve_id){
        setTimeout(()=>{
            if(current_solve_id == solve_id)
                toChange.setType("finalpath")
            }, delay)

    }
    
    static Solve(block){
        if(block.type == "finish"){
            this.solved = true
            
            Grid.showFinalPath(block, true)
            return;
        }
        if(block.type != "start"){
            block.setType("visited")
        }
        
        
    }


}

function getPath(elem){
    console.log(`Getting path using ${document.getElementById("algorithm-name").innerHTML}`)
    Astar.Reset()
    Dijkstra.Reset()
    Astar.solved = true
    Dijkstra.solved = true
    
    

    if(document.getElementById("algorithm-name").innerHTML == "Dijkstra"){
        Dijkstra.Reset()
        solveDijkstra()
    }
    else{
        Astar.Reset()
        solveStar()
    }
}

function solveStar(){
        
        Astar.Reset()
        allow_placement = false
        solve_id += 1
        my_solve_id = solve_id
        
        var maxIterations = 200;
        var i = 0;
        var speed = 50
        while (i < maxIterations && !Astar.solved && my_solve_id == solve_id) {
            (function(i) {
            setTimeout(function() {
                if(!Astar.solved && solve_id == my_solve_id){
                    Astar.solveNext()
                    
                }
               
            }, speed * i)
            })(i++)
        }
        allow_placement = true
    
   
}
function solveDijkstra(){
    allow_placement = false
    solve_id += 1
    my_solve_id = solve_id
    Dijkstra.Reset()
    var maxIterations = 100;
    var i = 0;
    var speed = 150
    while (i < maxIterations && !Dijkstra.solved && my_solve_id == solve_id) {
        (function(i) {
        setTimeout(function() {
            if(!Dijkstra.solved && solve_id == my_solve_id){
                Dijkstra.SolveNext()
            }
           
        }, speed * i)
        })(i++)
    }
    allow_placement = true
}


class Astar{
    static solved = false;
    static open = []
    static closed = []

    static Reset(){
        this.open = [Grid.start] 
        this.closed = [Grid.start]
        this.solved = false
        Grid.clearItems("visited")
        Grid.clearItems("closed")
        Grid.clearItems("finalpath")
    }
    static solveNext(){
        
        var current = this.lowestFcost(this.open)

        this.open.splice(this.open.indexOf(current), 1)
        this.closed.push(current)
        
        current.getAround(["wall", "start"], true).forEach(around => {   
            

            if(around == Grid.finish){
                around.parent = current
                this.solved =true
                Grid.showFinalPath(around, true)
                
                return;
            }
            var dist = distance(current.x, current.y, around.x, around.y)

            if(this.closed.includes(around)){
                return;
            }
            if(this.open.includes(around)){
                
                var gcost = dist + (current.gcost)
                var hcost = distance(around.x, around.y, Grid.finish.x, Grid.finish.y)
                var newfcost = gcost + hcost
                if(around.fcost > newfcost){
                    around.parent = current
                }
            }

            around.gcost = dist + current.gcost
            around.hcost = distance(around.x, around.y, Grid.finish.x, Grid.finish.y)
            around.fcost = around.gcost + around.hcost

          
            //around.showCosts()
            if(!this.open.includes(around) && !this.closed.includes(around)){
                this.open.push(around)
                around.setType("visited")
                around.parent = current
            }
      
        })
        if(current.type != "start"){
            current.setType("closed")
        }
        

      

    }
    static lowestFcost(open){
        var lowest = open[0]
        open.forEach(entry =>{
            if(entry.fcost < lowest.fcost){
                lowest = entry;
            }
        })
        return lowest   
    }

    

}





function setup(){
   

    document.addEventListener("mousedown", function(){isMouseDown = true})
    document.addEventListener("mouseup", function(){isMouseDown = false})
    
    generateGrid(35,15);
    Dijkstra.selected.push(Block.getBlock(0,0));
    Grid.setStart(Block.getBlock(3,11))
    Grid.setFinish(Block.getBlock(19,8))
    
}
window.addEventListener("load", function(){
    setup()
})





