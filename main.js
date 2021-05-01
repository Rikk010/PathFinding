maingrid = document.getElementById("maingrid")
maintable = document.getElementById("maintable")
tbody = document.getElementById("tbody")
isMouseDown = false
filltype = 'wall'
//var event = new CustomEvent("blockplaced");


class Block{
    static allBlocks = {};
    constructor(type,element, x, y ){
        this.type = type;
        this.element = element;
        this.x = x;
        this.y = y;
        
        Block.allBlocks[x.toString() + "-" + y.toString()] = this;
        this.setType(type)
        
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


function setFill(type){
    filltype= type;
}

function cellMouseDown(event){
    if(isMouseDown){
        
        Block.getBlockByString(event.target.id).setType(filltype)
        solveDijkstra()
    }
    
}
function generateGrid(width, height){
    for(h=0; h<height; h++){
        newRow = tbody.insertRow();
        for (w=0; w<width; w++){
            newCell = newRow.insertCell();
            newCell.id = w.toString() + "-" + h.toString();
           
            newCell.addEventListener("mouseover", cellMouseDown)
            new Block("empty", newCell, w, h)
        }   
    }
}




class Dijkstra{
    static selected = []
    static paths = {}
    static new_selected = []
    static solved = false

    static SolveNext(){

        Dijkstra.new_selected = []
        this.selected.forEach(entry => Dijkstra.Solve(entry))
        
        this.selected.forEach(origin =>  {
            
            var around = Dijkstra.getAround(origin)
            
            around.forEach(around_item => {
                Dijkstra.paths[around_item.niceName()] = origin.niceName()
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
        this.paths = []
        Grid.clearItems("visited");
        Grid.clearItems("finalpath")
    }

    static showpath(lastblock){
        var blockstr = lastblock.niceName();
        var paths = []
        while(Dijkstra.paths.hasOwnProperty(blockstr)){
            blockstr = Dijkstra.paths[blockstr]
            var toChange = Block.getBlockByString(blockstr)
            if(toChange.type != "start"){
                toChange.setType("finalpath")
            }
            
            
        }
        console.log(Dijkstra.paths)
        
        



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
        
        var final = final_blocks.filter(function (value, index, arr){
            
            return (value != null && !["wall", "visited", "start"].includes(value.type));
        })
        return final
    }


}



function solveDijkstra(){
    Dijkstra.Reset()

    console.log("Attempting")

    Dijkstra.selected = [Grid.start]
    var iter =940;
    var i = 0;
    while (i < iter && !Dijkstra.solved) {
        (function(i) {
        setTimeout(function() {
            if(!Dijkstra.solved){
                Dijkstra.SolveNext()
            }
           
        }, 0 * i)
        })(i++)
    }
   
    
    
}

function setup(){
   

    document.addEventListener("mousedown", function(){isMouseDown = true})
    document.addEventListener("mouseup", function(){isMouseDown = false})
    //document.addEventListener("blockplaced", solveDijkstra)
    generateGrid(50,30);
    Dijkstra.selected.push(Block.getBlock(0,0));
    //window.setInterval(solveDijkstra, 1000)
    
}
window.addEventListener("load", function(){
    setup()
})





