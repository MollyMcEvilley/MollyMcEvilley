<<<<<<< HEAD
const validValues = [1,2,3,4,5,6,7,8,9];
const cells = Array.from(document.querySelectorAll('input')); 
var possibles = Array.from(''.repeat(81)); 
var inProgress = false; 

for (i=0; i<81; i++) {
    cells[i].id='c' + i;
    possibles[i] = '123456789';
}

// EVENT LISTENERS

// check every keyup to make sure it's consistent w/ sudoku logic
for (i=0; i < cells.length; i++) {
    let cell = cells[i]; 
    cell.addEventListener('keyup', function (event){
        if (parseInt(event.key) > 0 && parseInt(event.key) < 10) {
            validateCell(i, cell.value);
        } else {
            cells[i].value = '';
        }
    }
)};

// listen for arrow keys and use them to navigate because I am lazy
for (i=0; i < cells.length; i++) {
    let cell = cells[i]; 
    cell.addEventListener('keydown', function(event) {
        if (event.key.startsWith("Arrow")) {
            navigate(cell, event.key); 
        } 
    })
}

// the reset button -- uh -- RESETs the sudoku grid to a pristine state
document.getElementById("reset").addEventListener('click', function() {
    for(i=0; i<cells.length; i++) {
        cells[i].classList.remove("userEntered");
        cells[i].classList.remove("solved"); 
        cells[i].value = "";
        cells[i].disabled = false; 
    }
})

// the solve button calls the solve function (derp)
document.getElementById("solve").addEventListener('click', solveSudoku); 

function solveSudoku () {
    //call function to get values from the UI into solution array
    if (inProgress == false) {
        getStarted(); 
    } else {
        updatePossibles()
    }
}

// FUNCTIONS

function validateCell (index, proposed) {
    //called by the keyup event listener to validate user input
    //and also by the solve functions to validate proposed solution values 
    let where = ''; 

    if (cells[index].value == '' || cells[index].value == undefined) {return true;}

    if (!validValues.includes(parseInt(cells[index].value))) {
        cells[index].value=''; 
        document.getElementById('alert').textContent = 'Valid values are numbers 1-9.'; 
        return false; 
    } 

    var row = getRow(index); 
    var col = getColumn(index); 
    var blk = getBlock(index); 

    for (valLoop=0; valLoop<81; valLoop++) {
        if (valLoop != index && cells[valLoop].value == proposed) {
            var otherRow = getRow(valLoop); 
            var otherCol = getColumn(valLoop); 
            var otherBlk = getBlock(valLoop);             

            if (otherBlk == blk) {where = 'block';}
            if (otherRow == row) {where = 'row';}
            if (otherCol == col) {where = 'column';}

            if (where.length > 1) {
                cells[index].value='';
                if(inProgress == true) {alert('Cleanup on aisle ' + index + '! There is already a ' + proposed + ' in this ' + where + '.');}
                    else {document.getElementById('alert').textContent = 'There is already a ' + proposed + ' in this ' + where + '.'; }
                    return false; 
            }
        }
    }
    return true; 
}

function getStarted() {
 
    for(startLoop=0; startLoop<81; i++) {
        if(inProgress == false) {
            //disable any additional user entries
            cells[startLoop].disabled = true; 

            //identify any user-entered values in the UI...
            let userEntered = cells[startLoop].value; 
            if (userEntered != '') {
                cells[startLoop].classList.add("userEntered"); 

                //...validate them again because shit happens
                if (validateCell (startLoop, userEntered)) {
                    //and remove the value from possibles for cells in the same row/column/block
                    updatePossibles(startLoop, userEntered);
                }  
            } 
        }
    }
    inProgress=true; 
    solveSudoku(); 
}

function updatePossibles(index, checkForValue) {
    let row = getRow(index); 
    let col = getColumn(index); 
    let blk = getBlock(index);         
    
    possibles[index] = ''; 

    for(checkLoop=0; checkLoop<81; checkLoop++) {
        if (checkLoop != index && possibles[checkLoop].includes(checkForValue)) {
            //get the cell's row / column / block
            var otherRow = getRow(index); 
            var otherCol = getColumn(index); 
            var otherBlk = getBlock(index);      
            
            if (otherBlk == blk || otherRow == row || otherCol == col) {
                possibles[checkLoop].replace(checkForValue, ''); 
                return true; 
            } else {
                return false; 
            }
        }
    }

}
 
function checkPossibles () {
    for (possLoop=0; possLoop<81; possLoop++) {
        if (possibles[possLoop].valueOf.length == 1) {
            if(validateCell(possLoop, possibles[possLoop])) {
                cells[possLoop].value = possibles[i]; 
                updatePossibles(possLoop, cells[possLoop].value); 
            }
        }
    }    
}

function getRow (i) {
    return Math.floor(i/9); 
}
function getColumn (i) {
    return i%9; 
}
function getBlock (i) {
    return i%3 + (Math.floor(i/27)*3);
}

// functions specific to the UI (HTML and CSS) but not to the sudoku logic

/* function validateInput (cell) {

    var num = parseInt(cell.value);
    var r = cell.className.substring(7,11); 
    var c = cell.className.substring(12,16); 
    var b = cell.className.substring(17,21);

    if (num < 1 || num > 9) {
        cell.value=""; 
        return; 
    }

    var check = Array.from(document.getElementsByClassName(r)); 

    for (i=0; i< check.length; i++) {
       if (i != check.indexOf(cell) && parseInt(check[i].value) == num) {
            alert("There is already a " + check[i].value + " in this row."); 
            cell.value = "";
            return;
        }
    }

    var check = Array.from(document.getElementsByClassName(c)); 

    for (i=0; i< check.length; i++) {
        if (i != check.indexOf(cell) && parseInt(check[i].value) == num) {
            alert("There is already a " + check[i].value + " in this column."); 
            cell.value = "";
            return;
        }
    }

    var check = Array.from(document.getElementsByClassName(b)); 

    for (i=0; i< check.length; i++) {
        if (i != check.indexOf(cell) && parseInt(check[i].value) == num) {
            alert("There is already a " + check[i].value + " in this block."); 
            cell.value = "";
            return;
        }
    }

    document.getElementById("alert").textContent = "So far so good."; 
 }
 */
 function navigate (cell, keyName) {
            
    var current = cells.indexOf(cell); 
    var goTo = -1; 

        if (keyName == "ArrowUp") {
            var goTo = current - 9; 
        } else if (keyName == "ArrowLeft") {
            var goTo = current - 1;  
        } else if (keyName == "ArrowDown") {
            var goTo = current + 9; 
        } else if (keyName == "ArrowRight") {
            var goTo = current + 1; 
        }
    
    if (goTo < 0 || goTo >= cells.length) { 
        return; 
    } else {
        cells[goTo].focus(); 
    }
=======
const validValues = [1,2,3,4,5,6,7,8,9];
const cells = Array.from(document.querySelectorAll('input')); 
var possibles = Array.from(''.repeat(81)); 
var inProgress = false; 

for (i=0; i<81; i++) {
    cells[i].id='c' + i;
    possibles[i] = '123456789';
}

// EVENT LISTENERS

// check every keyup to make sure it's consistent w/ sudoku logic
for (i=0; i < cells.length; i++) {
    let cell = cells[i]; 
    cell.addEventListener('keyup', function (event){
        if (parseInt(event.key) > 0 && parseInt(event.key) < 10) {
            validateCell(i, cell.value);
        } else {
            cells[i].value = '';
        }
    }
)};

// listen for arrow keys and use them to navigate because I am lazy
for (i=0; i < cells.length; i++) {
    let cell = cells[i]; 
    cell.addEventListener('keydown', function(event) {
        if (event.key.startsWith("Arrow")) {
            navigate(cell, event.key); 
        } 
    })
}

// the reset button -- uh -- RESETs the sudoku grid to a pristine state
document.getElementById("reset").addEventListener('click', function() {
    for(i=0; i<cells.length; i++) {
        cells[i].classList.remove("userEntered");
        cells[i].classList.remove("solved"); 
        cells[i].value = "";
        cells[i].disabled = false; 
    }
})

// the solve button calls the solve function (derp)
document.getElementById("solve").addEventListener('click', solveSudoku); 

function solveSudoku () {
    //call function to get values from the UI into solution array
    if (inProgress == false) {
        getStarted(); 
    } else {
        updatePossibles()
    }
}

// FUNCTIONS

function validateCell (index, proposed) {
    //called by the keyup event listener to validate user input
    //and also by the solve functions to validate proposed solution values 
    let where = ''; 

    if (cells[index].value == '' || cells[index].value == undefined) {return true;}

    if (!validValues.includes(parseInt(cells[index].value))) {
        cells[index].value=''; 
        document.getElementById('alert').textContent = 'Valid values are numbers 1-9.'; 
        return false; 
    } 

    var row = getRow(index); 
    var col = getColumn(index); 
    var blk = getBlock(index); 

    for (valLoop=0; valLoop<81; valLoop++) {
        if (valLoop != index && cells[valLoop].value == proposed) {
            var otherRow = getRow(valLoop); 
            var otherCol = getColumn(valLoop); 
            var otherBlk = getBlock(valLoop);             

            if (otherBlk == blk) {where = 'block';}
            if (otherRow == row) {where = 'row';}
            if (otherCol == col) {where = 'column';}

            if (where.length > 1) {
                cells[index].value='';
                if(inProgress == true) {alert('Cleanup on aisle ' + index + '! There is already a ' + proposed + ' in this ' + where + '.');}
                    else {document.getElementById('alert').textContent = 'There is already a ' + proposed + ' in this ' + where + '.'; }
                    return false; 
            }
        }
    }
    return true; 
}

function getStarted() {
 
    for(startLoop=0; startLoop<81; i++) {
        if(inProgress == false) {
            //disable any additional user entries
            cells[startLoop].disabled = true; 

            //identify any user-entered values in the UI...
            let userEntered = cells[startLoop].value; 
            if (userEntered != '') {
                cells[startLoop].classList.add("userEntered"); 

                //...validate them again because shit happens
                if (validateCell (startLoop, userEntered)) {
                    //and remove the value from possibles for cells in the same row/column/block
                    updatePossibles(startLoop, userEntered);
                }  
            } 
        }
    }
    inProgress=true; 
    solveSudoku(); 
}

function updatePossibles(index, checkForValue) {
    let row = getRow(index); 
    let col = getColumn(index); 
    let blk = getBlock(index);         
    
    possibles[index] = ''; 

    for(checkLoop=0; checkLoop<81; checkLoop++) {
        if (checkLoop != index && possibles[checkLoop].includes(checkForValue)) {
            //get the cell's row / column / block
            var otherRow = getRow(index); 
            var otherCol = getColumn(index); 
            var otherBlk = getBlock(index);      
            
            if (otherBlk == blk || otherRow == row || otherCol == col) {
                possibles[checkLoop].replace(checkForValue, ''); 
                return true; 
            } else {
                return false; 
            }
        }
    }

}
 
function checkPossibles () {
    for (possLoop=0; possLoop<81; possLoop++) {
        if (possibles[possLoop].valueOf.length == 1) {
            if(validateCell(possLoop, possibles[possLoop])) {
                cells[possLoop].value = possibles[i]; 
                updatePossibles(possLoop, cells[possLoop].value); 
            }
        }
    }    
}

function getRow (i) {
    return Math.floor(i/9); 
}
function getColumn (i) {
    return i%9; 
}
function getBlock (i) {
    return i%3 + (Math.floor(i/27)*3);
}

// functions specific to the UI (HTML and CSS) but not to the sudoku logic

/* function validateInput (cell) {

    var num = parseInt(cell.value);
    var r = cell.className.substring(7,11); 
    var c = cell.className.substring(12,16); 
    var b = cell.className.substring(17,21);

    if (num < 1 || num > 9) {
        cell.value=""; 
        return; 
    }

    var check = Array.from(document.getElementsByClassName(r)); 

    for (i=0; i< check.length; i++) {
       if (i != check.indexOf(cell) && parseInt(check[i].value) == num) {
            alert("There is already a " + check[i].value + " in this row."); 
            cell.value = "";
            return;
        }
    }

    var check = Array.from(document.getElementsByClassName(c)); 

    for (i=0; i< check.length; i++) {
        if (i != check.indexOf(cell) && parseInt(check[i].value) == num) {
            alert("There is already a " + check[i].value + " in this column."); 
            cell.value = "";
            return;
        }
    }

    var check = Array.from(document.getElementsByClassName(b)); 

    for (i=0; i< check.length; i++) {
        if (i != check.indexOf(cell) && parseInt(check[i].value) == num) {
            alert("There is already a " + check[i].value + " in this block."); 
            cell.value = "";
            return;
        }
    }

    document.getElementById("alert").textContent = "So far so good."; 
 }
 */
 function navigate (cell, keyName) {
            
    var current = cells.indexOf(cell); 
    var goTo = -1; 

        if (keyName == "ArrowUp") {
            var goTo = current - 9; 
        } else if (keyName == "ArrowLeft") {
            var goTo = current - 1;  
        } else if (keyName == "ArrowDown") {
            var goTo = current + 9; 
        } else if (keyName == "ArrowRight") {
            var goTo = current + 1; 
        }
    
    if (goTo < 0 || goTo >= cells.length) { 
        return; 
    } else {
        cells[goTo].focus(); 
    }
>>>>>>> 3131b38d948dd218ebace5375aa943b73a665307
}