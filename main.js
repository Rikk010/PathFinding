maingrid = document.getElementById("maingrid")
maintable = document.getElementById("maintable")
tbody = document.getElementById("tbody")
isMouseDown = false
filltype = 'wall'
allow_placement = true
solve_id = "1"


use_side_step = false


autofind = false

//var event = new CustomEvent("blockplaced");


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

    getAround(side_step_only){
        var currentblock = this;
        var final_blocks = [ ]
        if(side_step_only){
            
            final_blocks = [
                Block.getBlock(currentblock.x+1, currentblock.y + 1),
                Block.getBlock(currentblock.x-1, currentblock.y - 1),
                Block.getBlock(currentblock.x+1, currentblock.y - 1),
                Block.getBlock(currentblock.x-1, currentblock.y + 1)
            ]
        }
        else{
            final_blocks = [Block.getBlock(currentblock.x + 1, currentblock.y),
                Block.getBlock(currentblock.x - 1, currentblock.y),
                Block.getBlock(currentblock.x, currentblock.y + 1),
                Block.getBlock(currentblock.x, currentblock.y - 1)]
            
        }
        
        var final = final_blocks.filter(function (value, index, arr){
            
            return (value != null && !["wall", "start"].includes(value.type));
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

}
function ClearGrid(){
    Grid.clearItems("visited")
    Grid.clearItems("finalpath")
}
function ResetGrid(){
    Block.GetAllBlocks().forEach(entry => entry.setType("empty"))
    Grid.start =null;
    Grid.finish = null;
}

function setFill(type){
    filltype= type;
}

function cellMouseDown(event){
    
    
    
    target = event.target
    
    if((isMouseDown || event.type=="click") && (allow_placement || autofind)){
        
        var x = Block.getBlockByString(target.id).setType(filltype)
     
        if(autofind){
            solveDijkstra()
        }   
    }
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

function toggleAutoFind(item){
    autofind = !autofind
    Grid.clearItems("visited");
    Grid.clearItems("finalpath");
    
    item.classList.toggle("active")
}
function toggleSideSteps(item){
    use_side_step = !use_side_step
    item.classList.toggle("active")
}

function distance(x1, y1, x2, y2) {
    var dx = Math.abs(x2 - x1);
    var dy = Math.abs(y2 - y1);

    var min = Math.min(dx, dy);
    var max = Math.max(dx, dy);

    var diagonalSteps = min;
    var straightSteps = max - min;

    return Math.sqrt(2) * diagonalSteps + straightSteps;
}

class Dijkstra{
    static selected = []
  
    static new_selected = []
    static solved = false

    static SolveNext(){

        Dijkstra.new_selected = []
        this.selected.forEach(entry => Dijkstra.Solve(entry))
        
        this.selected.forEach(origin =>  {
            
            var around = Dijkstra.getAround(origin)
            
            around.forEach(around_item => {
                around_item.setParent(origin.niceName())
               
                if(!Dijkstra.new_selected.includes(around_item)){
                    Dijkstra.new_selected.push(around_item)
                }
            })  
        })
        Dijkstra.selected = Dijkstra.new_selected;
        

        
        
    }
    
    static Reset(){
        this.solved = false;
        this.selected = []
        this.new_selected = []
        
        Grid.clearItems("visited");
        Grid.clearItems("finalpath")
    }

    static showpath(lastblock){
        var blockstr = lastblock.niceName();
        var finalpaths = []
        var cur = Block.getBlockByString(blockstr)
        while(cur.parent != null){
            cur = Block.getBlockByString(cur.parent)
            if (cur.type != 'start'){
                finalpaths.push(cur)
            }
            

        }


        finalpaths.reverse().forEach((value,index) => this.setToFinished(value, 80*index,solve_id))
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
            
            Dijkstra.showpath(block)
            return;
        }
        if(block.type != "start"){
            block.setType("visited")
        }
        
        
    }

    static getAround(currentblock){
        var final_blocks = [ 
            Block.getBlock(currentblock.x + 1, currentblock.y),
            Block.getBlock(currentblock.x - 1, currentblock.y),
            Block.getBlock(currentblock.x, currentblock.y + 1),
            Block.getBlock(currentblock.x, currentblock.y - 1)
        ]
        if(use_side_step){
            
            final_blocks = final_blocks.concat([
                Block.getBlock(currentblock.x+1, currentblock.y + 1),
                Block.getBlock(currentblock.x-1, currentblock.y - 1),
                Block.getBlock(currentblock.x+1, currentblock.y - 1),
                Block.getBlock(currentblock.x-1, currentblock.y + 1)
            ])
        }
        console.log(final_blocks.length)
        var final = final_blocks.filter(function (value, index, arr){
            
            return (value != null && !["wall", "visited", "start"].includes(value.type));
        })
        return final
    }


}
function solveStar(){
    
    Astar.solveNext();
}

function lowestFcost(arr, closed){
    console.log("seraching for lowest")
    console.log(arr)
    var lowest = arr[0]
    
    console.log(lowest)
    arr.forEach((entry,index) =>{
       console.log(entry)
    
        if(entry.fcost < lowest.fcost && entry.type=="visited"){
            console.log(entry.type)
            lowest = entry;
            console.log("newest lowest")
            console.log(lowest)
        }
    
    })
    console.log("lowest")
    console.log(lowest)
    return lowest;
}
class Astar{
    static open = []
    static closed = []

    static init = false
    
    static solveNext(){
        if(!this.init){
            this.open = [Grid.start]
            Grid.start.fcost = 100
            this.init = true
            console.log('ini')
            
        }
        console.log("sending open")
        console.log(this.open)
        var bl = lowestFcost(this.open, this.closed)
            console.log(bl)
            //Straight movement
            var all_around = []
            bl.getAround(false).forEach(around => {
                all_around.push(around)
               
                around.gcost = 10 + (around.parent ? around.parent.gcost : 0)
                around.setType("visited")
                around.hcost = Math.round(10*distance(around.x, around.y, Grid.finish.x, Grid.finish.y))
                around.fcost = around.gcost + around.hcost
                around.showCosts()
                this.open.push(around)
               

            })
            //Diagonal movement
            bl.getAround(true).forEach(dig_around => {
                all_around.push(dig_around)
                
                dig_around.gcost = 14 + (dig_around.parent ? dig_around.parent.gcost : 0)
                dig_around.setType("visited")
                dig_around.hcost = Math.round(10*distance(dig_around.x, dig_around.y, Grid.finish.x, Grid.finish.y))
                dig_around.fcost = dig_around.gcost + dig_around.hcost
                console.log(dig_around.fcost)
                dig_around.showCosts()
                this.open.push(dig_around)
            })
            
            this.closed.push(bl.niceName())
            
            delete this.open[0]
            bl.setType("closed")

    }

    

}



function solveDijkstra(){
    allow_placement = true
    solve_id += 1
    my_solve_id = solve_id
    Dijkstra.Reset()

    console.log("Attempting")

    Dijkstra.selected = [Grid.start]
    var iter =940;
    var i = 0;
    var speed = autofind ? 0 : 50
    while (i < iter && !Dijkstra.solved && my_solve_id == solve_id) {
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





