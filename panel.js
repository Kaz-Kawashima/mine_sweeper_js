export class Panel {
    constructor(){
        this.is_open = false
        this.is_flagged = false
    }
    flag(){
        this.is_flagged = !this.is_flagged
    }
}

export class BlankPanel extends Panel {
    constructor(){
        super()
        this.bomb_value = -1
    }
    open(){
        if (this.is_flagged) {
            return true
        } else {
            this.is_open = true
            return true
        }
    }
    toString(){
        let non_braking_space = String.fromCharCode(160)
        if (this.is_flagged) {
            return "F"
        } else if (this.is_open) {
            if (this.bomb_value == 0) {
                return non_braking_space
            } else {
                return this.bomb_value.toString();
            }
        } else {
            return "#"
        }
    }
}

export class BombPanel extends Panel {
    constructor(flag = false){
        super()
        this.is_flagged = flag
    }
    open() {
        if (this.is_flagged) {
            return true
        } else {
            this.is_open = true
            return false
        }
    }
    toString() {
        if (this.is_flagged) {
            return "F"
        } else {
            if (this.is_open) {
                return "B"
            } else {
                return "#"
            }
        }
    }
}

export class BorderPanel extends Panel {
    constructor(){
        super()
        this.is_open = true
    }
    open() {
        return true
    }
    toString() {
        return "="
    }
}

