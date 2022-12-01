let currState = null
let startTime = null
let playerName = null
let difficulty = null
const storage = window.localStorage

const table = document.querySelector("#main_table")
const mode = document.querySelector("#difficulty")
const game = document.querySelector(".game")
const submit = document.querySelector("#submit")
const result = document.querySelector(".result")
const restart = document.querySelector("#restart")
const scoresTable = document.querySelector("#scores_table")
const homePage = document.querySelector("#homepage")
const clearTable = document.querySelector("#clear_records")

function xyCord(td) {
    const y = td.cellIndex
    const tr = td.parentNode
    const x = tr.sectionRowIndex
    return [x, y]
}

function generateTable(state) {
    let row = null
    let cell = null
    currState = JSON.parse(JSON.stringify(state))
    let body = document.createElement("tbody")
    for (row of state) {
        const tr = document.createElement("tr")
        for (cell of row) {
            const td = document.createElement("td")
            if (cell.type === "blackCell") {
                td.className = "cell black"
                if (cell.lightBulbsAround !== null) {
                    td.innerHTML = cell.lightBulbsAround
                }
            } else if (cell.type === "cell") {
                if (cell.illuminated) {
                    td.className = "cell illuminated"
                    if (cell.lamp) {
                        td.className = "cell illuminated"
                        td.innerHTML = `<img src="../images/lamp.png" width="${80}%" height="${80}%" alt="">`
                    }
                } else {
                    td.className = "cell"
                }
            }
            tr.appendChild(td)
        }
        body.appendChild(tr)

    }
    table.appendChild(body)
}

function updateTable(state) {
    for (let i = 0; i < state.length; i++) {
        for (let j = 0; j < state[0].length; j++) {
            const val = state[i][j]
            const cell = table.rows[i].cells[j]
            if (val.type === "blackCell") {
                if (correctBlackCell(state, i, j)) {
                    cell.className = "cell black correct"
                } else {
                    cell.className = "cell black"
                }
                if (val.lightBulbsAround !== null) {
                    cell.innerHTML = val.lightBulbsAround
                }
            } else if (val.type === "cell") {
                if (val.illuminated) {
                    cell.className = "cell illuminated"
                    cell.innerHTML = ""
                    if (val.lamp) {
                        if (val.wrong) {
                            cell.className = "cell illuminated wrong"
                        }
                        cell.innerHTML = `<img src="../images/lamp.png" width="${80}%" height="${80}%" alt="">`
                    }
                } else {
                    cell.className = "cell"
                    cell.innerHTML = ""
                }
            }
        }
    }

}

function onCellClick(e) {
    let cell = e.target
    if (cell.matches("img")) {
        cell = cell.parentElement;
    }
    if (cell.matches("td")) {
        const [i, j] = xyCord(cell)
        let cellData = currState[i][j]
        if (cellData.type === "cell") {
            if (!cellData.lamp) {
                [currState[i][j].illuminated, currState[i][j].lamp] = [true, true]
            } else {
                [currState[i][j].illuminated, currState[i][j].lamp] = [false, false]
            }
        }
        illuminate(currState)
        updateTable(currState)
    }
}

function illuminate(state) {
    let row;
    for (row of state) {
        let c;
        for (c of row) {
            if (c.type === "cell") {
                c.wrong = false;
                if (c.illuminated === true && c.lamp === false) {
                    c.illuminated = false
                }
            }
        }
    }
    for (let i = 0; i < state.length; i++) for (let j = 0; j < state[0].length; j++) if (state[i][j].lamp === true) {
        let iUp = i - 1, iDown = i + 1, jLeft = j - 1, jRight = j + 1
        while (iUp > -1) {
            if (state[iUp][j].type === "blackCell") {
                break
            }
            if (state[iUp][j].lamp) {
                state[iUp][j].wrong = true
                state[i][j].wrong = true
                break
            } else if (state[iUp][j].illuminated === false) {
                state[iUp][j].illuminated = true
            }
            iUp--
        }
        while (iDown < state.length) {
            if (state[iDown][j].type === "blackCell") {
                break
            }
            if (state[iDown][j].lamp) {
                state[iDown][j].wrong = true
                state[i][j].wrong = true
                break
            } else if (state[iDown][j].illuminated === false) {
                state[iDown][j].illuminated = true
            }
            iDown++
        }
        while (jLeft > -1) {
            if (state[i][jLeft].type === "blackCell") {
                break
            }
            if (state[i][jLeft].lamp) {
                state[i][jLeft].wrong = true
                state[i][j].wrong = true
                break
            } else if (state[i][jLeft].illuminated === false) {
                state[i][jLeft].illuminated = true
            }
            jLeft--
        }
        while (jRight < state[0].length) {
            if (state[i][jRight].type === "blackCell") {
                break
            }
            if (state[i][jRight].lamp) {
                state[i][jRight].wrong = true
                state[i][j].wrong = true
                break
            } else if (state[i][jRight].illuminated === false) {
                state[i][jRight].illuminated = true
            }
            jRight++
        }

    }

}

function startGame(e) {
    if (e.target.matches("button")) {
        playerName = document.querySelector("#name").value
        if (playerName === "") {
            alert("Name field cannot be empty!");
            return
        }
        document.querySelector("#player_name").innerHTML = `player: ${playerName}`
        let timer = document.querySelector("#passed_time")
        setInterval(() => {
            timer.innerHTML = `${Math.floor((new Date() - startTime) / 1000)} secs`
        }, 1000)
        homePage.style.display = "none"
        game.style.display = "flex"
        if (e.target.matches("#easy")) {
            difficulty = "easy"
            generateTable(easy)
        } else if (e.target.matches("#normal")) {
            difficulty = "normal"
            generateTable(normal)
        } else {
            difficulty = "difficult"
            generateTable(difficult)
        }
        updateTable(currState)
        startTime = new Date()

    }
}

function correctBlackCell(state, i, j) {
    if (state[i][j].lightBulbsAround !== null) {
        let cnt = 0
        if (state[i - 1] !== undefined && state[i - 1][j].lamp) {
            cnt++
        }
        if (state[i + 1] !== undefined && state[i + 1][j].lamp) {
            cnt++
        }
        if (state[i][j - 1] !== undefined && state[i][j - 1].lamp) {
            cnt++
        }
        if (state[i][j + 1] !== undefined && state[i][j + 1].lamp) {
            cnt++
        }
        if (cnt !== state[i][j].lightBulbsAround) {
            return false
        }
    }
    return true
}

function solutionIsCorrect(state) {
    for (let i = 0; i < state.length; i++) {
        for (let j = 0; j < state[0].length; j++) {
            if (state[i][j].type === "cell") {
                if (state[i][j].wrong || !state[i][j].illuminated) {
                    return false
                }
            } else {
                if (!correctBlackCell(state, i, j)) {
                    return false
                }
            }
        }
    }
    return true
}

function updateScoreBoard() {
    document.querySelectorAll("#scores_table > tr").forEach(r => r.remove())
    if (storage.getItem("games") !== null) {
        let games = storage.getItem("games").split(";").map(g => JSON.parse(g))
        for (g of games) {
            console.log(g)
            const tr = document.createElement("tr")
            let td = document.createElement("td")
            td.innerHTML = g.name
            tr.appendChild(td)
            td = document.createElement("td")
            td.innerHTML = g.score
            tr.appendChild(td)
            td = document.createElement("td")
            td.innerHTML = g.gameMode
            tr.appendChild(td)
            td = document.createElement("td")
            td.innerHTML = g.time
            tr.appendChild(td)
            scoresTable.appendChild(tr)
        }
    }
}

table.addEventListener("click", onCellClick)
mode.addEventListener("click", startGame)
submit.addEventListener("click", () => {
    game.style.display = "none"
    result.style.display = "flex"
    let timeElapsed = Math.floor((new Date() - startTime) / 1000)
    let sc = 2000 - timeElapsed * 5
    if (sc < 50) {
        sc = 50
    }
    if (solutionIsCorrect(currState)) {
        document.querySelector("#winLost").innerHTML = "You Won!"
        document.querySelector("#score").innerHTML = `Score: ${sc}`
    } else {
        document.querySelector("#winLost").innerHTML = "You Lost!"
        document.querySelector("#score").innerHTML = "score: 0"
    }
    if (storage.getItem("games") !== null) {
        storage.setItem("games", storage.getItem("games") + ";" + JSON.stringify({
            name: playerName, score: sc, gameMode: difficulty, time: timeElapsed
        }))
    } else {
        storage.setItem("games", JSON.stringify({
            name: playerName, score: sc, gameMode: difficulty, time: timeElapsed
        }))
    }
    console.log(storage)
})
restart.addEventListener("click", () => {
    clearInterval()
    document.querySelector("#passed_time").innerHTML = "0 secs"
    result.style.display = "none"
    homePage.style.display = "flex"
    table.innerHTML = ""
    updateScoreBoard()

})
clearTable.addEventListener("click", () => {
    storage.clear()

    document.querySelectorAll("#scores_table > tr").forEach(r => r.remove())
})
updateScoreBoard()
