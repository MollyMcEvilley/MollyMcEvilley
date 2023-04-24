var validValues = ['1', '2','3','4','5','6', '7', '8', '9']; 

const cells = Array.from(document.querySelectorAll('input')); 
const issues = document.getElementById("alert"); 
var cellInfo = [];
var inProgress = false; 
var solved = 0

for (let i=0; i<81; i++) {
    cells[i].id='c' + i;
    let cell = {id: i
            , row: (Math.floor(i/9)).toString()
            , col: (i%9).toString()
            , blk: (Math.floor((i%9)/3) + (Math.floor(i/27)*3)).toString()
            , poss: '123456789'
            , num: ''
            , solved: false}; 
    cellInfo.push(cell); 
}

// FUNCTIONS

function validateCell (chkIndex, proposed) {
    //called by the keyup event listener to validate user input
    let where = ''; 

    // Look at all other cells in the grid to check for conflicts with the 
    // proposed value...
    for (let i=0; i<81; i++) {
        if (cells[i].value == proposed && i != chkIndex) {
            if (rows[i] == rows[chkIndex]) {
                where = 'row'; 
            } else if (columns[i] == columns[chkIndex]) {
                where = 'column';
            } else if (blocks[i] == blocks[chkIndex]) {
                where = 'block'; 
            }

            if (where.length > 1) {
                cells[chkIndex].value='';
                if(inProgress == true) {console.log('Cleanup on aisle ' + chkIndex + '! There is already a ' + proposed + ' in this ' + where + '.');}
                else {issues.textContent = 'There is already a ' + proposed + ' in this ' + where + '.'; }
                return false; 
            }
        }
    }
    return true; 
}
 
function solveSudoku () {

    if (!inProgress) {
        if (!getUserInput()) {
            issues.textContent = 'Nothing to solve here.';
        }
    } 
    
    if (inProgress) {
        while (checkPossibles()) {    
            checkPossibles(); 
        } 

        if (checkGroupCombosForValue()) {
            checkPossibles(); 
        }

        if (solved == 81) {
            issues.textContent = 'All done!'; 
        } else {
            issues.textContent = "We done all we can do and we cain't do no more.";
        }
    }
}
    
function getUserInput () {
    let toUpdate = []; 

    for (let i=0; i<81; i++) {
        cells[i].disabled = true; 
        if (!cells[i].value) {
            cells[i].classList.add('notSolved'); 
            cells[i].value = cellInfo[i].poss;
        } else {
            let value = cells[i].value; 
            cells[i].classList.add('userEntered'); 
            cellInfo[i].num = value; 
            cellInfo[i].solved = true; 
            cellInfo[i].poss = '';
            solved++; 
            toUpdate.push(i); 
        }
    }

    if (toUpdate.length == 0) {
        return false; 
    } else {
        for (let i=0; i<toUpdate.length; i++) {
            eliminatePossibility(toUpdate[i], cellInfo[toUpdate[i]].num);
        }
        inProgress = true; 
        return true; 
    }
}

function eliminatePossibility (index, val) {
    
    for (let i=0; i<81; i++) {
        if (i==index || cellInfo[i].solved == true || !cellInfo[i].poss) {
            
        } else if ((cellInfo[i].row == cellInfo[index].row || cellInfo[i].col == cellInfo[index].col || cellInfo[i].blk == cellInfo[index].blk) 
                && cellInfo[i].poss.includes(val)) {
        cellInfo[i].poss = cellInfo[i].poss.replace(val, ''); 
        cells[i].value = cellInfo[i].poss;
         
        if (!cellInfo[i].poss && !cellInfo[i].num) {alert("Here is where it's fucked up -- index " + index + " and val " + val);}
        }
    }
}

function checkPossibles () {
    if (solved==81) {return false;}

    let updated = false; 

    for (let i=0; i<81; i++) {
        let val = cellInfo[i].poss; 
        if (val.length == 1) {
            cells[i].classList.remove('notSolved'); 
            cells[i].classList.add('solved'); 
            cellInfo[i].num = val;
            cellInfo[i].poss = ''; 
            cellInfo[i].solved = true;
            solved++;  
            eliminatePossibility(i, val); 
            updated = true; 
        }
    }  
    
    if(updated) {return true;}

    //check rows/columns/blocks for numbers with only 1 possible location
    for (let grp=0; grp<27; grp++) {
        let candidates = []; 
        let i = 0; 
        while(i < 81 && candidates.length < 9) {
            if(cellInfo[i].row == grp || cellInfo[i].col == grp-9 || cellInfo[i].blk == grp-18) {
                candidates.push(i); 
            } 
            i++;
        }

        for(let val=1; val<10; val++) {
            if(checkGroupForValue(candidates, val)) {
                updated = true; 
            } 
        }
    }

    if(updated) {return true;}

    for (let grp=0; grp<27; grp++) {
        let candidates = []; 
        let i = 0; 
        while(i < 81 && candidates.length < 9) {
            if(cellInfo[i].row == grp || cellInfo[i].col == grp-9 || cellInfo[i].blk == grp-18 ){
                candidates.push(i); 
            } 
            i++;
        }

        let multiDigits = []; 
        for (i=0; i<candidates.length; i++) {
            let multi = cellInfo[candidates[i]].poss;
            if (multi.length > 1 && multi.length <6) {
                if (!multiDigits.includes(multi)) {
                    multiDigits.push(multi); 
                }
            }
        }

        let m = 0;
        while(m < multiDigits.length) {
            let val = multiDigits[m]; 
            if (checkGroupForValue(candidates, val)) {
                updated = true; 
            }
            m++; 
        }
    }

    if(updated) {return true;}

    for(v=0; v<9; v++) {
        for (comboBlock=0; comboBlock<9; comboBlock++) {
            if (checkGroupCombosForValue(validValues[v], comboBlock)) {
                return true; 
           }
        }
    }
    
    return updated; 
}
    

 
function checkGroupForValue(candidates, val) {
    let updated = false; 
    let valPossibles = [];
    let chkNum = ''; 
    chkNum = String(val); 
    

   for(let i=0; i<candidates.length; i++) {
        let possible = cellInfo[candidates[i]].poss; 
        if (possible.includes(chkNum) && chkNum.length == 1) {
            valPossibles.push(candidates[i]); 
        } else if (possible == val && chkNum.length > 1) {
            valPossibles.push(candidates[i]); 
        }
    }            

    if(valPossibles.length !== chkNum.length) {return false; }

    if(valPossibles.length == 1 && chkNum.length == 1) {
        let solvedCell = valPossibles[0]; 
        cellInfo[solvedCell].num = chkNum; 
        cells[solvedCell].value = chkNum;
        cells[solvedCell].classList.remove('notSolved'); 
        cells[solvedCell].classList.add('solved'); 
        cellInfo[solvedCell].poss = ''; 
        cellInfo[solvedCell].solved = true; 
        solved++; 
        eliminatePossibility(solvedCell, chkNum); 
        updated = true; 
    } else {
        for(let n=0; n < chkNum.length; n++) {
            digitOfVal = chkNum.charAt(n);
            for (let i=0; i<candidates.length; i++) {
                if (cellInfo[candidates[i]].poss != val && cellInfo[candidates[i]].poss.includes(digitOfVal)) {
                    cellInfo[candidates[i]].poss = cellInfo[candidates[i]].poss.replace(digitOfVal, ''); 
                    cells[candidates[i]].value = cellInfo[candidates[i]].poss 
                    updated = true;
                }
            }
        }
    }

    return updated;
}



// EVENT LISTENERS

// check every keyup to make sure it's consistent w/ sudoku logic
for (let i=0; i < 81; i++) {
    let cell = cells[i]; 
    cell.addEventListener('keyup', function (event){
        if (parseInt(event.key) > 0 && parseInt(event.key) < 10) {
            validateCell(i, cell.value);
        } else {
            cell.value = '';
        }
    }
)};

// listen for arrow keys and use them to navigate because I am lazy
for (let i=0; i < 81; i++) {
    let cell = cells[i]; 
    cell.addEventListener('keydown', function(event) {
        if (event.key.startsWith("Arrow")) {
            navigate(cell, event.key); 
        } 
    })
};

document.getElementById("reset").addEventListener('click', resetGrid); 

document.getElementById("solve").addEventListener('click', solveSudoku); 

// UTILITY FUNCTIONS - reset and navigate

function resetGrid () {
    for(let i=0; i<81; i++) {
        let cell = cells[i]; 
        cell.classList.remove("userEntered");
        cell.classList.remove("solved"); 
        cell.classList.remove("notSolved");
        cell.value = '';
        cell.disabled = false; 
        inProgress = false;  
        cellInfo[i].num = '';
        cellInfo[i].poss = '123456789';
        cellInfo[i].solved = false;
        issues.textContent = '';
    }
}

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
    
    if (goTo < 0 || goTo >= 81) { 
        return; 
    } else {
        cells[goTo].focus(); 
    }
}

function checkGroupCombosForValue(val, b){
    let updated = false;

    let blk = [];
    let row = [];  
    let col = []; 

    for(let chkBlock=0; chkBlock<81; chkBlock++) {
        if (cellInfo[chkBlock].blk == b && cellInfo[chkBlock].poss.includes(val)) {
            blk.push(chkBlock); 
            if (!row.includes(cellInfo[chkBlock].row)) {
                row.push(cellInfo[chkBlock].row);
            }
            if (!col.includes(cellInfo[chkBlock].col)) {
                col.push(cellInfo[chkBlock].col);
            }
        }
    }

    if (blk.length > 1 && col.length == 1) {
        for (let i=0; i<81; i++) {
            if (cellInfo[i].blk != b) {
                if (cellInfo[i].col == col[0]) {
                    if (cellInfo[i].poss.includes(val)) {
                        cellInfo[i].poss = cellInfo[i].poss.replace(val, ''); 
                        cells[i].value = cellInfo[i].poss;   
                    }                          
                } 
            }
        }
        if(updated){return true;}
    }    
    if (blk.length > 1 && row.length == 1) {
        for (let i=0; i<81; i++) {
            if (cellInfo[i].blk != b) {
                if (cellInfo[i].row == row[0]) {
                    if (cellInfo[i].poss.includes(val)) {
                        cellInfo[i].poss = cellInfo[i].poss.replace(val, ''); 
                        cells[i].value = cellInfo[i].poss; 
                        updated = true;                             
                    }                          
                } 
            }
        }
        if(updated){return true;}
    }    
    
    return updated; 
}