const validValues = ['1', '2','3','4','5','6', '7', '8', '9']; 

const cells = Array.from(document.querySelectorAll('input')); 
const msgToUser = document.getElementById("alert"); 
var cellInfo = [];
var inProgress = false; 
var completed = 0
var startTime; 

for (let i=0; i<81; i++) {
    cells[i].id='c' + i;
    let cell = {id: i
            , row: (Math.floor(i/9)).toString()
            , col: (i%9).toString()
            , blk: (Math.floor((i%9)/3) + (Math.floor(i/27)*3)).toString()
            , poss: '123456789'
            , solved: ''
            , proposed: ''
            , n: ''
    }; 
    cellInfo.push(cell); 
}

// FUNCTIONS

function validateCell (chkIndex, proposed) {
    //called by the keyup event listener to validate user input
    let where = ''; 

    // Look at all other cells in the grid to check for conflicts with the 
    // proposed value...
    checkUntil: {
        for (let i=0; i<81; i++) {
            if (cells[i].value == proposed && i != chkIndex) {
                if (cellInfo[i].row == cellInfo[chkIndex].row) {
                    where = 'row'; 
                    break checkUntil;
                }
                if (cellInfo[i].col == cellInfo[chkIndex].col) {
                    where = 'column';
                    break checkUntil;
                }
                if (cellInfo[i].blk == cellInfo[chkIndex].blk) {
                    where = 'block';
                    break checkUntil;
                }
            }
        }
    } //end checkUntil for loop

    if (where.length > 1) {
        cells[chkIndex].value='';
        if(inProgress == true) {console.log('Cleanup on aisle ' + chkIndex + '! There is already a ' + proposed + ' in this ' + where + '.');}
        else {msgToUser.textContent = 'There is already a ' + proposed + ' in this ' + where + '.'; }
        return false; 
    }
    return true; 
}
 
function solveSudoku () {
    
    startTime = Date.now(); 

    if (!inProgress) {
        console.log ("solveSudoku calls getUserInput")
        getUserInput();
    } 
    
    while (checkPossibles()) {
        checkPossibles(); 
    }

    theEnd(); 
}

    
function getUserInput () {
    let updated = false; 

    for (let i=0; i<81; i++) {
        cells[i].disabled = true; 
        if (!cells[i].value) {
            cells[i].classList.add('notSolved'); 
            cells[i].value = cellInfo[i].poss; 
        } else {
            cells[i].classList.add('userEntered'); 
            cellInfo[i].solved = cells[i].value; 
            cellInfo[i].poss = ''; 
            completed++; 
            updated = true; 
        }
    }
         
    for (let i=0; i<81; i++) {
        if (cellInfo[i].solved) {
            updatePossiblesFromSolvedCell(i);  
        }
    } 
    console.log("getUserInput found " + completed + " user-entered cells.")
    return updated;    
}

function updatePossiblesFromSolvedCell (solvedCell) {

    let val = cellInfo[solvedCell].solved; 
    console.log("Updating possibles for solved cell " + solvedCell + " value " + val); 
    
    let r = getOtherRcbCells(1, solvedCell); 
    let c = getOtherRcbCells(2, solvedCell); 
    let b = getOtherRcbCells(3, solvedCell); 
    for (let chk=0; chk<8; chk++) {
        if (cellInfo[r[chk]].poss.includes(val)) {
            cellInfo[r[chk]].poss = cellInfo[r[chk]].poss.replace(val,''); 
            cells[r[chk]].value = cellInfo[r[chk]].poss;
        }                    
        if (cellInfo[c[chk]].poss.includes(val) && !r.includes(c[chk])) {
            cellInfo[c[chk]].poss = cellInfo[c[chk]].poss.replace(val,''); 
            cells[c[chk]].value = cellInfo[c[chk]].poss;
        }
        if (cellInfo[b[chk]].poss.includes(val) && !r.includes(b[chk]) && !c.includes(b[chk])) {
            cellInfo[b[chk]].poss = cellInfo[b[chk]].poss.replace(val,''); 
            cells[b[chk]].value = cellInfo[b[chk]].poss;
        }                           
    }
}

function checkPossibles () {
    if (completed==81) {return false;}
    else {
        let updated = false; 

        //  STEP 1 -- Look for cells with only one possible value
        console.log("checkPossibles step 1 -- look for cells with only 1 possibility"); 

        for (let i=0; i<81; i++) {
            let val = cellInfo[i].poss; 
            if (val.length == 1) {
                cells[i].classList.remove('notSolved'); 
                cells[i].classList.add('solved'); 
                cellInfo[i].solved = val;
                cellInfo[i].poss = ''; 
                completed++;  
                updatePossiblesFromSolvedCell(i);  
                updated = true; 
            }
        }  

        if (updated) {
            console.log("checkPossibles step 1 -- " + completed + " total completed cells -- return true");
            return true; 
        } else {"checkPossibles step 1 -- nothing to solve"
            
        }

        // STEP 2 -- look for possible values that are only included in a single cell in a given row/column/block
        //           (if a value can only be in one place, we can solve the cell) 
        console.log("checkPossibles step 2 -- look for values that can only possibly be located in a single cell for r/c/b");
        
        for (let rcb=1; rcb<4; rcb++) {
            for (let group = 0; group<9; group++) {
                for(let v=0; v<9; v++) {
                    let val = validValues[v]; 
                    let candidates = getAllUnsolvedRcbCells(rcb, group);
                    let valPossibles = []; 
                    for(let c=0; c<candidates.length; c++) {
                        chkCell = candidates[c]; 
                        if (cellInfo[chkCell].poss.includes(val)) {
                            valPossibles.push(candidates[c]); 
                        }
                    }
                    if (valPossibles.length == 1) {
                        let solvedCell = valPossibles[0]; 
                        cellInfo[solvedCell].solved = val; 
                        cells[solvedCell].value = val;
                        cells[solvedCell].classList.remove('notSolved'); 
                        cells[solvedCell].classList.add('solved'); 
                        cellInfo[solvedCell].poss = ''; 
                        completed++; 
                        updatePossiblesFromSolvedCell(solvedCell);  
                        updated = true;                         
                    }
                }
            }
        }
        if (updated) {
            console.log("checkPossibles step 2 -- " + completed + " total completed cells -- return true");
            return true; 
        }   else {
            console.log("checkPossibles step 2 -- nothing to solve");
        }

        // STEP 3 -- look for possibilities of x length that re-occur exactly x times in a given row/column/block
        //           (if row 1 has a 34 in one cell and a 34 in another cell, none of the other cells in row 1 can be a 3 or a 4) 

        console.log("checkPossibles step 3 ");
        for (let rcb=1; rcb<=3; rcb++) {
            for (let group = 0; group<=9; group++) {
                let candidates = getAllUnsolvedRcbCells(rcb, group);
                for (i=0; i<candidates.length; i++) {
                    let multi = cellInfo[candidates[i]].poss;
                    if (multi.length > 1 && multi.length <6) {
                        if (checkGroupForValue(candidates, multi)) {
                            return true; 
                        } 
                    }
                }
            }
        }


        if (updated) {
            console.log("STEP 3 -- " + completed + " total completed cells -- return true");
            return true; 
        }   else {
            console.log("STEP 3 -- nothing new -- on to STEP 4");
        }

        // STEP 4 - Block/row and block/column combinations 
        for(v=0; v<9; v++) {
            for (b=0; b<9; b++) {
                let blk = [];
                let row = [];  
                let col = []; 
    
                let val=validValues[v];
    
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
                            if (cellInfo[i].col == col[0] && cellInfo[i].poss.includes(val)) {
                                cellInfo[i].poss = cellInfo[i].poss.replace(val, ''); 
                                cells[i].value = cellInfo[i].poss;   
                                updated = true;                         
                            } 
                        }
                    }
    
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
                }    
            }
        }
        if (!updated) { 
            console.log("STEP 4 finds nothing rew -- return false"); 
        } else {
            console.log("STEP 4 finds something to update -- " + completed + " total completed cells -- return true"); 
            return true; 
        }
    }
}
function eliminatePossibility (index, val) {
    
    for (let i=0; i<81; i++) {
       if (i!=index && !cellInfo[i].completed 
           && (cellInfo[i].row == cellInfo[index].row || cellInfo[i].col == cellInfo[index].col 
                || cellInfo[i].blk == cellInfo[index].blk)
           && cellInfo[i].poss.includes(val)) {
            if (!cellInfo[i].poss.length > 1) {
                let carryOn = confirm("Logical whoopsie", "Cell " + i + " has only one possibility left and it would be eliminated by cell " +
                    index + " being set to " + val + ". Click OK to bumble on to the end.  Click cancel to stop.");
                if (carryOn) {
                } else {
                    theEnd(); 
                }
                 
            } else {
                cellInfo[i].poss = cellInfo[i].poss.replace(val, ''); 
                cells[i].value = cellInfo[i].poss;
            }
       }
    }
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
        cellInfo[solvedCell].solved = chkNum; 
        cells[solvedCell].value = chkNum;
        cells[solvedCell].classList.remove('notSolved'); 
        cells[solvedCell].classList.add('solved'); 
        cellInfo[solvedCell].poss = ''; 
        completed++; 
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
        completed = 0; 
        inProgress = false;  
        cellInfo[i].num = '';
        cellInfo[i].poss = '123456789';
        cellInfo[i].solved = '';
        msgToUser.textContent = '';
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

function theEnd () {
    let solves = 0; 
    let userCells = 0; 
    endTime = Date.now(); 
    solveTime = endTime - startTime; 
    console.log("Solved in " + solveTime + "milliseconds"); 
    for (let i=0; i<81; i++) {
        if (cells[i].classList.contains("userEntered")) {
            userCells++; 
        } else if (cells[i].classList.contains("solved")) {
            solves++;             
        }
    }

    let yourPart = "You entered values for " + userCells + " cells (the ones in green). ";
    let myPart = ""; 
    
    if (solves + userCells < 81) { 
        if (solves == 0) {
            myPart = "Alas! I narrowed down the possibilities, but I couldn't solve any other cells based on that starting point. ";
        } else if (solves==1) {
            myPart = "I was only able to logically deduce a value for one other cell (the one with the purple-y color). "; 
        } else {
            myPart = "I was able to solve " + solves + " of the other cells (the purple-y ones), but I couldn't finish the puzzle. ";
        }
        myPart = myPart + "That might be because I'm a sad and incomplete little program, but it might also be because there is more than one possible solution. "
    } else {
        myPart = "I figured out values for the other " + solves + " cells in " + solveTime + " milliseconds and we are all done!";
    }
    
    farewellMsg = yourPart + myPart; 
    msgToUser.textContent = farewellMsg;
}

function getOtherRcbCells (rcb, id) {
    
    let group = []; 
    let i=0;
    
    if (rcb==1) {
        r = cellInfo[id].row; 
        while(i<81 && group.length < 8) {
            if (i!=id && cellInfo[i].row == r) {
                group.push(i); 
            }
            i++;
        }
    } else if (rcb==2) {
        c = cellInfo[id].col; 
        while(i<81 && group.length < 8) {
            if (i!=id && cellInfo[i].col == c) {
                group.push(i); 
            }
            i++; 
        }
    } else if (rcb==3) {
        b = cellInfo[id].blk; 
        while(i<81 && group.length < 8) {
            if (i!=id && cellInfo[i].blk == b) {
                group.push(i); 
            }
            i++; 
        }
    }
    return group; 
}

function getAllUnsolvedRcbCells (rcb, rcbNum) {
    
    let group = []; 
    let i=0;
    
    if (rcb==1) {
        while(i<81 && group.length < 9) {
            if (cellInfo[i].row == rcbNum && !cellInfo[i].solved) {
                group.push(i); 
            }
            i++;
        }
    } else if (rcb==2) {
        while(i<81 && group.length < 9) {
            if (cellInfo[i].col == rcbNum && !cellInfo[i].solved) {
                group.push(i); 
            }
            i++; 
        }
    } else if (rcb==3) {
        while(i<81 && group.length < 9) {
            if (cellInfo[i].blk == rcbNum && !cellInfo[i].solved) {
                group.push(i); 
            }
            i++; 
        }
    }
    return group; 
}



function getCellsSolvedForValue (val) {
    let solves = []; 
    for (let i=0; i<81; i++) {
        if (cellInfo[i].solved == val) {
            solves.push(i); 
        }
    }
    return solves; 
}
