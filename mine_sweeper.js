import {BlankPanel, BombPanel, BorderPanel} from "./panel.js"

const GameStatus = Object.freeze({
    Uninitialized: "Uninitialized",
    Playing: "Playing",
    Win: "Win",
    Lose: "Lose"
})

class GameBoard{
    constructor(y, x, numBomb){
        this.sizeY = y
        this.sizeX = x
        this.fieldSizeY = y + 2
        this.fieldSizeX = x + 2
        this.numBomb = numBomb
        this.field = []
        for(let row = 0; row < this.fieldSizeY; row++){
            let panel_row = []
            for(let col = 0; col < this.fieldSizeX; col++){
                panel_row.push(new BlankPanel())
            }
            this.field.push(panel_row)
        }
        //Fill Boarder
        for(let row = 0; row < this.fieldSizeY; row++){
            this.field[row][0] = new BorderPanel()
            this.field[row][this.fieldSizeX -1] = new BorderPanel()
        }
        for(let col = 0; col < this.fieldSizeX; col++){
            this.field[0][col] = new BorderPanel()
            this.field[this.fieldSizeY - 1][col] = new BorderPanel()
        }
        this.status = GameStatus.Uninitialized
        this.cursor_row = 1;
        this.cursor_col = 1;
    }

    init(){
        for(let row = 1; row <= this.sizeY; row++){
            for(let col = 1; col <= this.sizeX; col++){
                this.field[row][col] = new BlankPanel()
            }
        }
        this.status = GameStatus.Uninitialized
        this.cursor_row = 1;
        this.cursor_col = 1;       
    }

    UpdateStatus() {
        if(this.status == GameStatus.Uninitialized){
            return
        }
        this.status = GameStatus.Win
        for(let row = 1; row <= this.sizeY; row++) {
            for(let col = 1; col <= this.sizeX; col++){
                let p = this.field[row][col]
                if ((p instanceof BlankPanel) && !p.is_open){
                    this.status = GameStatus.Playing
                }
                if ((p instanceof BombPanel) && p.is_open){
                    this.status = GameStatus.Lose
                    return
                }
            }
        }
        return
    }

    setBomb() {
        let counter = 0
        while(counter < this.numBomb){
            let row = Math.floor(Math.random() * this.sizeY) + 1
            let col = Math.floor(Math.random() * this.sizeX) + 1
            if (row == this.cursor_row && col == this.cursor_col){
                continue
            }
            if (!(this.field[row][col] instanceof BombPanel)){
                // Keep flag state
                let flag = this.field[row][col].is_flagged
                this.field[row][col] = new BombPanel(flag)
                counter++
            }
        }
        this.calcBombNumGb()
        this.status = GameStatus.Playing
    }

    calcBombNumGb(){
        for(let row = 1; row <= this.sizeY; row++) {
            for(let col = 1; col <= this.sizeX; col++){
                let p = this.field[row][col]
                if (p instanceof BlankPanel){
                    this.calcBombNum(row, col)
                }
            }
        }
    }

    calcBombNum(y, x){
        let counter = 0
        for(let row = y - 1; row <= y + 1; row++){
            for(let col = x - 1; col <= x + 1; col++){
                let p = this.field[row][col]
                if(p instanceof BombPanel){
                    counter++
                }
            }
        }
        this.field[y][x].bomb_value = counter
    }

    openAround(y, x) {
        let count = 0
        for(let row = y - 1; row <= y + 1; row++){
            for(let col = x - 1; col <= x + 1; col++){
                let p = this.field[row][col]
                if(!p.is_open && !p.is_flagged){
                    this.field[row][col].open()
                    count++
                }
            }
        }
        return count
    }

    cascadeOpen(){
        let new_open = 1
        while(new_open > 0){
            new_open = 0
            for(let row = 1; row <= this.sizeY; row++){
                for(let col = 1; col <= this.sizeX; col++){
                    let p = this.field[row][col]
                    if (p.is_open && p.bomb_value === 0){
                        new_open += this.openAround(row, col)
                    }
                }
            }
        }
    }

    bombOpen(){
        for(let row = 1; row <= this.sizeY; row++){
            for(let col = 1; col <= this.sizeX; col++){
                let p = this.field[row][col]
                if (p instanceof BombPanel){
                    this.field[row][col].open()
                }
            }
        }
    }

    isFinished(){
        for(let row = 1; row <= this.sizeY; row++){
            for(let col = 1; col <= this.sizeX; col++){
                let p = this.field[row][col]
                if (p instanceof BlankPanel && !p.is_open){
                    return false
                }
            }
        } 
        return true
    }

    countFlag(){
        let flag_count = 0
        for(let row = 1; row <= this.sizeY; row++){
            for(let col = 1; col <= this.sizeX; col++){
                if(this.field[row][col].is_flagged){
                    flag_count++
                }
            }
        } 
        return flag_count
    }

    toString(){
        let text = ""
        for(let row = 0; row < this.fieldSizeY; row++){
            for(let col = 0; col < this.fieldSizeX; col++){
                let ps = this.field[row][col].toString()
                if (row === this.cursor_row) {
                    if (col === 0) {
                        ps = ">"
                    } else if (col === this.fieldSizeX - 1) {
                        ps = "<"
                    }
                } else if(col === this.cursor_col){
                    if(row === 0) {
                        ps = "v"
                    } else if (row === this.fieldSizeY - 1) {
                        ps = "^"
                    }
                } 
                if(row === this.cursor_row && col === this.cursor_col){
                    if(ps === "#"){
                        ps = "@"
                    } else {
                        ps = "_"
                    }
                }
                text += ps
                text += " "
            }
            text += "\n"
        }
        let flag_count = this.countFlag()
        let prompt = "\ninput <- ^v -> / O open / F flag (" + flag_count + ")\n"
        text += prompt
        return text
    }

    arrowUp(){
        this.cursor_row -= 1
        if (this.cursor_row < 1) {
            this.cursor_row = 1
        }
    }

    arrowDown(){
        this.cursor_row += 1
        if (this.cursor_row > this.sizeY) {
            this.cursor_row = this.sizeY
        }
    }

    arrowLeft(){
        this.cursor_col -= 1
        if (this.cursor_col < 1) {
            this.cursor_col = 1
        }
    }

    arrowRight(){
        this.cursor_col += 1
        if (this.cursor_col > this.sizeX) {
            this.cursor_col = this.sizeX
        }
    }

    open() {
        if (this.status == GameStatus.Uninitialized){
            this.setBomb()
        }
        let is_safe = this.field[this.cursor_row][this.cursor_col].open()
        if(is_safe){
            this.cascadeOpen()
        }
        this.UpdateStatus()
    }

    flag() {
        this.field[this.cursor_row][this.cursor_col].flag()
    }
}

let gb = new GameBoard(9,9,10)
var bodyElement = document.body;
bodyElement.style.fontFamily = "Consolas, monospace";
var div = document.createElement("div")
document.body.appendChild(div);
div.innerText = gb.toString()
document.addEventListener('keydown', function(event) {
    let key = event.key
    if (key === 'ArrowUp') {
        gb.arrowUp()
    } else if (key === 'ArrowDown') {
        gb.arrowDown()
    } else if (key === 'ArrowLeft') {
        gb.arrowLeft()
    } else if (key === 'ArrowRight') {
        gb.arrowRight()
    } else if (key === "o" || key === "O") {
        gb.open()
        switch(gb.status)
        {
            case GameStatus.Win:
                alert("You Win!")
                gb.init()
                break
            case GameStatus.Lose:
                gb.bombOpen()
                div.innerText = gb.toString()          
                alert("Game Over!")
                gb.init()
        }       
    } else if (key === "f" || key === "F") {
        gb.flag()
    }
    div.innerText = gb.toString()
})
