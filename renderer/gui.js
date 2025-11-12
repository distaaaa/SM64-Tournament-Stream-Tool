window.onload = init;

// const fs = require('fs');
// const path = require('path');

const { fs, path } = window.electron;

// const mainPath = path.join(__dirname, '..', '..', 'Stream Tool', 'Resources', 'Texts');

// Global Variables
let currentP1WL = "Nada";
let currentP2WL = "Nada";
let currentBestOf = "Bo5";

let movedSettings = false;
let movedStageStriker = false;

const wlButtons1 = document.getElementById("wlButtons1");
const wlButtons2 = document.getElementById('wlButtons2');

const p1StarAdd = document.getElementById('p1StarAdd');
const p1StarRemove = document.getElementById('p1StarRemove');

const p2StarAdd = document.getElementById('p2StarAdd');
const p2StarRemove = document.getElementById('p2StarRemove');

const viewport = document.getElementById('viewport');

const p1NameInp = document.getElementById('p1Name');
const p1TagInp = document.getElementById('p1Tag');
const p2NameInp = document.getElementById('p2Name');
const p2TagInp = document.getElementById('p2Tag');

let currentTheme = "ttt";
let currentBRB = false;

// const p1PFP = document.getElementById('p1PFP');
// const p2PFP = document.getElementById('p2PFP');

const p1PFP = document.getElementById('file1');
const previewContainer1 = document.getElementById('preview1');
const previewImage1 = previewContainer1.querySelector('.image-preview__image');
const previewDefaultText1 = previewContainer1.querySelector('.image-preview__default-text');

const p2PFP = document.getElementById('file2');
const previewContainer2 = document.getElementById('preview2');
const previewImage2 = previewContainer2.querySelector('.image-preview__image');
const previewDefaultText2 = previewContainer2.querySelector('.image-preview__default-text');


const p1Win1 = document.getElementById('winP1-1');
const p1Win2 = document.getElementById('winP1-2');
const p1Win3 = document.getElementById('winP1-3');
const p2Win1 = document.getElementById('winP2-1');
const p2Win2 = document.getElementById('winP2-2');
const p2Win3 = document.getElementById('winP2-3');

const p1W = document.getElementById('p1W');
const p1L = document.getElementById('p1L');
const p2W = document.getElementById('p2W');
const p2L = document.getElementById('p2L');

const p1StarCount = document.getElementById('p1Stars');
const p2StarCount = document.getElementById('p2Stars');

const roundInp = document.getElementById('roundName');

const display = document.getElementById("timer");
const countDown = document.getElementById("countDownLength");
let timer = null;
let startTime = 0;
let elapsedTime = 0;
let isRunning = false;
let countedDown = false;

let countdownTimer;
let remainingTime;

const forceWL = document.getElementById('forceWLToggle');
const stageStrikeCheckBox = document.getElementById('stageStrikeToggle');
const timerCheckBox = document.getElementById("timerCheck");
let timerOn = false;

let streamToolDirectory = './resources/Stream Tool/Resources';
let timerFolder = `${streamToolDirectory}/Texts/Timer Info`;
let textsFolder = `${streamToolDirectory}/Texts/Simple Texts`;

// Stage Striking Buttons
const bob = document.getElementById('bob');
const wf = document.getElementById('wf');
const jrb = document.getElementById('jrb');
const ccm = document.getElementById('ccm');
const bbh = document.getElementById('bbh');
const hmc = document.getElementById('hmc');
const lll = document.getElementById('lll');
const ssl = document.getElementById('ssl');
const ddd = document.getElementById('ddd');
const sl = document.getElementById('sl');
const wdw = document.getElementById('wdw');
const thi = document.getElementById('thi');
const ttm = document.getElementById('ttm');
const ttc = document.getElementById('ttc');
const rr = document.getElementById('rr');

let bobToggle = false;
let wfToggle = false;
let jrbToggle = false;
let ccmToggle = false;
let bbhToggle = false;
let hmcToggle = false;
let lllToggle = false;
let sslToggle = false;
let dddToggle = false;
let slToggle = false;
let wdwToggle = false;
let thiToggle = false;
let ttmToggle = false;
let ttcToggle = false;
let rrToggle = false;

function init() {
    checkRound();
    writeStageStrikingVisualizer();
    // Listener for update button
    document.getElementById('updateRegion').addEventListener("click", writeScoreboard);
    // document.getElementById('settingsRegion').addEventListener("click", moveViewportSettings);
    document.getElementById('stageStrikeRegion').addEventListener("click", moveViewportStageStriker);

    document.getElementById('goBack').addEventListener("click", goBack);

    // Move viewport to the center to avoid animation bugs
    viewport.style.right = "0%";

    p1PFP.addEventListener("change", showImage1);
    p2PFP.addEventListener("change", showImage2);
    previewImage1.addEventListener("click", removeImage1);
    previewImage2.addEventListener("click", removeImage2);
    // Score Checks
    p1Win1.addEventListener("click", changeScoreTicks1);
    p2Win1.addEventListener("click", changeScoreTicks1);
    p1Win2.addEventListener("click", changeScoreTicks2);
    p2Win2.addEventListener("click", changeScoreTicks2);
    p1Win3.addEventListener("click", changeScoreTicks3);
    p2Win3.addEventListener("click", changeScoreTicks3);

    // Listeners for [W] and [L] buttons
    p1W.addEventListener("click", setWLP1);
    p1L.addEventListener("click", setWLP1);
    p2W.addEventListener("click", setWLP2);
    p2L.addEventListener("click", setWLP2);

    // Listener for star counter buttons
    p1StarAdd.addEventListener("click", addStarP1);
    p1StarRemove.addEventListener("click", removeStarP1);
    p2StarAdd.addEventListener("click", addStarP2);
    p2StarRemove.addEventListener("click", removeStarP2);

    // Check player names for skin
    p1NameInp.addEventListener("input", resizeInput);
    p2NameInp.addEventListener("input", resizeInput);

    // Resize box when user types
    p1TagInp.addEventListener("input", resizeInput);
    p2TagInp.addEventListener("input", resizeInput);

    // Set click listeners to change the "best of" status
    document.getElementById("bo1Div").addEventListener("click", changeBestOf);
    document.getElementById("bo3Div").addEventListener("click", changeBestOf);
    document.getElementById("bo5Div").addEventListener("click", changeBestOf);

    // Initialize Values
    document.getElementById("bo5Div").style.backgroundImage = "linear-gradient(to top, #575757, #00000000)";
    document.getElementById("bo3Div").style.color = "var(--text2)";
    document.getElementById("bo1Div").style.color = "var(--text2)";

    document.getElementById("back").addEventListener("click", changeBRB);
    document.getElementById("brb").addEventListener("click", changeBRB);

    document.getElementById("back").style.backGroundImage = "linear-gradient(to top, #575757, #00000000)";
    document.getElementById("brb").style.color = "var(--text2)";

    // Check if round is Grand Finals
    roundInp.addEventListener("input", checkRound);

    // Add a listener to the swap button
    document.getElementById('swapButton').addEventListener("click", swap);
    // Add a listener to the clear button
    document.getElementById('clearButton').addEventListener("click", clearPlayers);

    // Add listeners for timer control buttons
    document.getElementById("startTimerDiv").addEventListener("click", startCountDown);
    document.getElementById("stopTimerDiv").addEventListener("click", stopTimer);
    document.getElementById("resetTimerDiv").addEventListener("click", resetTimer);

    timerCheckBox.addEventListener("click",toggleTimer);

    forceWL.addEventListener("click", forceWLtoggles);
    stageStrikeCheckBox.addEventListener("click", toggleStageStrikingMenu);

    fs.writeFileSync(path.join(timerFolder, "Start Time.txt"), '0');
    fs.writeFileSync(path.join(timerFolder, "Elapsed Time.txt"), '0');

    // Stage Striking stuff

    bob.addEventListener("click", function(){
        if(!bobToggle){
            bob.querySelector('img').classList.add('grayscale');
        } else{
            bob.querySelector('img').classList.remove('grayscale');
        }
        bobToggle = !bobToggle;
        writeStageStrikingVisualizer();
        currentTheme = 'bob';
    });

    wf.addEventListener("click", function(){
        if(!wfToggle){
            wf.querySelector('img').classList.add('grayscale');
        } else{
            wf.querySelector('img').classList.remove('grayscale');
        }
        wfToggle = !wfToggle;
        writeStageStrikingVisualizer();
        currentTheme = 'wf';
    });

    jrb.addEventListener("click", function(){
        if(!jrbToggle){
            jrb.querySelector('img').classList.add('grayscale');
        } else{
            jrb.querySelector('img').classList.remove('grayscale');
        }
        jrbToggle = !jrbToggle;
        writeStageStrikingVisualizer();
        currentTheme = 'jrb';
    });

    ccm.addEventListener("click", function(){
        if(!ccmToggle){
            ccm.querySelector('img').classList.add('grayscale');
        } else{
            ccm.querySelector('img').classList.remove('grayscale');
        }
        ccmToggle = !ccmToggle;
        writeStageStrikingVisualizer();
        currentTheme = 'ccm';
    });

    bbh.addEventListener("click", function(){
        if(!bbhToggle){
            bbh.querySelector('img').classList.add('grayscale');
        } else{
            bbh.querySelector('img').classList.remove('grayscale');
        }
        bbhToggle = !bbhToggle;
        writeStageStrikingVisualizer();
        currentTheme = 'bbh';
    });

    hmc.addEventListener("click", function(){
        if(!hmcToggle){
            hmc.querySelector('img').classList.add('grayscale');
        } else{
            hmc.querySelector('img').classList.remove('grayscale');
        }
        hmcToggle = !hmcToggle;
        writeStageStrikingVisualizer();
        currentTheme = 'hmc';
    });

    lll.addEventListener("click", function(){
        if(!lllToggle){
            lll.querySelector('img').classList.add('grayscale');
        } else{
            lll.querySelector('img').classList.remove('grayscale');
        }
        lllToggle = !lllToggle;
        writeStageStrikingVisualizer();
        currentTheme = 'lll';
    });

    ssl.addEventListener("click", function(){
        if(!sslToggle){
            ssl.querySelector('img').classList.add('grayscale');
        } else{
            ssl.querySelector('img').classList.remove('grayscale');
        }
        sslToggle = !sslToggle;
        writeStageStrikingVisualizer();
        currentTheme = 'ssl';
    });

    ddd.addEventListener("click", function(){
        if(!dddToggle){
            ddd.querySelector('img').classList.add('grayscale');
        } else{
            ddd.querySelector('img').classList.remove('grayscale');
        }
        dddToggle = !dddToggle;
        writeStageStrikingVisualizer();
        currentTheme = 'ddd';
    });

    sl.addEventListener("click", function(){
        if(!slToggle){
            sl.querySelector('img').classList.add('grayscale');
        } else{
            sl.querySelector('img').classList.remove('grayscale');
        }
        slToggle = !slToggle;
        writeStageStrikingVisualizer();
        currentTheme = 'sl';
    });

    wdw.addEventListener("click", function(){
        if(!wdwToggle){
            wdw.querySelector('img').classList.add('grayscale');
        } else{
            wdw.querySelector('img').classList.remove('grayscale');
        }
        wdwToggle = !wdwToggle;
        writeStageStrikingVisualizer();
        currentTheme = 'wdw';
    });

    thi.addEventListener("click", function(){
        if(!thiToggle){
            thi.querySelector('img').classList.add('grayscale');
        } else{
            thi.querySelector('img').classList.remove('grayscale');
        }
        thiToggle = !thiToggle;
        writeStageStrikingVisualizer();
        currentTheme = 'thi';
    });

    ttm.addEventListener("click", function(){
        if(!ttmToggle){
            ttm.querySelector('img').classList.add('grayscale');
        } else{
            ttm.querySelector('img').classList.remove('grayscale');
        }
        ttmToggle = !ttmToggle;
        writeStageStrikingVisualizer();
        currentTheme = 'ttm';
    });

    ttc.addEventListener("click", function(){
        if(!ttcToggle){
            ttc.querySelector('img').classList.add('grayscale');
        } else{
            ttc.querySelector('img').classList.remove('grayscale');
        }
        ttcToggle = !ttcToggle;
        writeStageStrikingVisualizer();
        currentTheme = 'ttc';
    });

    rr.addEventListener("click", function(){
        if(!rrToggle){
            rr.querySelector('img').classList.add('grayscale');
        } else{
            rr.querySelector('img').classList.remove('grayscale');
        }
        rrToggle = !rrToggle;
        writeStageStrikingVisualizer();
        currentTheme = 'rr';
    });

    document.getElementById('resetStages').addEventListener("click", resetStageStatuses);
}

function resetStageStatuses(){
    currentTheme = 'ttt';
    const stages = document.getElementsByTagName('button');
    for(let i = 0; i < stages.length; i++){
        console.log(i);
        stages[i].querySelector('img').classList.remove('grayscale');
    }
    bobToggle = false;
    wfToggle = false;
    jrbToggle = false;
    ccmToggle = false;
    bbhToggle = false;
    hmcToggle = false;
    lllToggle = false;
    sslToggle = false;
    dddToggle = false;
    slToggle = false;
    wdwToggle = false;
    thiToggle = false;
    ttmToggle = false;
    ttcToggle = false;
    rrToggle = false;
    writeStageStrikingVisualizer();
}

function toggleStageStrikingMenu(){
    if(stageStrikeCheckBox.checked == false){
        document.getElementById('stageStrikeRegion').style.display = "none";
    } else{
        document.getElementById('stageStrikeRegion').style.display = "flex";
    }
}

function toggleTimer() {
    if(timerCheckBox.checked == false){
        document.getElementById('countDownLength').disabled = true;
        document.getElementById('startTimerDiv').disabled = true;
        document.getElementById('stopTimerDiv').disabled = true;
        document.getElementById('resetTimerDiv').disabled = true;
        timerOn = false;
    } else{
        document.getElementById('countDownLength').disabled = false;
        document.getElementById('startTimerDiv').disabled = false;
        document.getElementById('stopTimerDiv').disabled = false;
        document.getElementById('resetTimerDiv').disabled = false;
        timerOn = true;
    }
}

function startCountDown() {
    if(!countedDown && countDown.value != 0){
        fs.writeFileSync(path.join(timerFolder, "Elapsed Time.txt"), String(countDown.value));
        if (!isRunning) {
            if (remainingTime === undefined) {
                remainingTime = countDown.value; // Initialize remaining time only once
            }
            countdownTimer = setInterval(function() {
                if (remainingTime > 0) {
                    // Display the countdown in the format: "00:03" for 3 seconds remaining
                    // let minutes = Math.floor(remainingTime / 60);
                    let seconds = remainingTime % 60;
                    display.textContent = `${seconds}`;
                    remainingTime--;
                } else {
                    clearInterval(countdownTimer); // Stop the countdown
                    display.textContent = "GO!";  // Display "GO!"
                    setTimeout(startTimer, 0);  // Wait 1 second, then start the main timer
                }
            }, 1000);
        }
        countedDown = true;
    } else{
        startTimer();
    }
}

function startTimer() {
    if (!isRunning) {
        startTime = Date.now() - elapsedTime;
        fs.writeFileSync(path.join(timerFolder, "Start Time.txt"), String(startTime));
        fs.writeFileSync(path.join(timerFolder, "Elapsed Time.txt"), '0');
        timer = setInterval(updateTimer, 1000);
        isRunning = true;
    }
}

function stopTimer() {
    if (isRunning) {
        clearInterval(timer);
        elapsedTime = Date.now() - startTime;
        fs.writeFileSync(path.join(timerFolder, "Elapsed Time.txt"), String(elapsedTime));
        isRunning = false;
    }
}

function resetTimer() {
    clearInterval(timer);
    clearInterval(countdownTimer); // Clear countdown timer as well
    startTime = 0;
    elapsedTime = 0;
    fs.writeFileSync(path.join(timerFolder, "Start Time.txt"), String(startTime));
    fs.writeFileSync(path.join(timerFolder, "Elapsed Time.txt"), String(elapsedTime));
    remainingTime = undefined; // Reset the remaining time when reset
    isRunning = false;
    countedDown = false;
    display.textContent = "0";
    currentTheme = 'ttt';
}

function updateTimer(){
    const currentTime = Date.now();
    elapsedTime = currentTime - startTime;
    let hours = Math.floor(elapsedTime / (1000 * 60 * 60));
    let minutes = Math.floor(elapsedTime / (1000 * 60) % 60);
    let seconds = Math.floor(elapsedTime/1000 % 60);

    if(Math.floor(elapsedTime/1000) < 60){
        display.textContent=`${seconds}`;
    } else if (Math.floor(elapsedTime/(60*1000) < 60)) {
        seconds = String(seconds).padStart(2, "0");
        display.textContent=`${minutes}:${seconds}`;
    } else {
        seconds = String(seconds).padStart(2, "0");
        minutes = String(minutes).padStart(2, "0");
        display.textContent = `${hours}:${minutes}:${seconds}`;
    }
}

function showImage1() {
    const file = this.files[0];
    if (file) {
        const reader = new FileReader();
        previewDefaultText1.style.display = "none";
        previewImage1.style.display = "block";
        reader.addEventListener("load", function () {
            if (previewImage1) {
                console.log('true');
                previewImage1.setAttribute("src", this.result);
            } else {
                console.log('false');
            }
            // previewImage1.setAttribute("src", this.result); // original
        });

        reader.readAsDataURL(file);
    }
}

function showImage2() {
    const file = this.files[0];
    if (file) {
        const reader = new FileReader();
        previewDefaultText2.style.display = "none";
        previewImage2.style.display = "block";
        reader.addEventListener("load", function () {
            if (previewImage2) {
                console.log('true');
                previewImage2.setAttribute("src", this.result);
            } else {
                console.log('false');
            }
            // previewImage2.setAttribute("src", this.result); // original
        });

        reader.readAsDataURL(file);
    }
}

function removeImage1() {
    document.getElementById('file1').value = "";
    if (!previewImage1.src.endsWith('index.html')) {
        console.log('pog1');
        previewImage1.setAttribute("src", ""); // remove if statement for original
    } else {
        console.log('elsepog1');
        console.log(previewImage1);
    }

    previewImage1.style.display = "none";
    previewDefaultText1.style.display = "block";
}

function removeImage2() {
    document.getElementById('file2').value = "";
    if (!previewImage2.src.endsWith('index.html')) {
        console.log('pog2');
        previewImage2.setAttribute("src", ""); // remove if/else statement for original
    } else {
        console.log('elsepog2');
        console.log(previewImage2);
    }
    previewImage2.style.display = "none";
    previewDefaultText2.style.display = "block";
}

function moveViewportSettings() {
    if (!movedSettings) {
        viewport.style.right = "40%";
        document.getElementById('overlay').style.opacity = "25%";
        document.getElementById('goBack').style.display = "block"
        movedSettings = true;
    }
}

function goBack() {
    viewport.style.right = "0%";
    document.getElementById('overlay').style.opacity = "100%";
    document.getElementById('goBack').style.display = "none";
    document.getElementById('goBack').style.left = "179px";
    movedSettings = false;
    movedStageStriker = false;
    writeScoreboard();
    writeStageStrikingVisualizer();
}

function moveViewportStageStriker() {
    if (!movedStageStriker) {
        viewport.style.right = "-40%";
        document.getElementById('goBack').style.left = "0px";
        document.getElementById('overlay').style.opacity = "25%";
        document.getElementById('goBack').style.display = "block";
        movedStageStriker = true;
        writeStageStrikingVisualizer();
    }
}

//whenever clicking on the first score tick
function changeScoreTicks1() {
    let pNum = 1;
    if (this == p2Win1) {
        pNum = 2;
    }

    //deactivate wins 2 and 3
    document.getElementById('winP' + pNum + '-2').checked = false;
    document.getElementById('winP' + pNum + '-3').checked = false;
}
//whenever clicking on the second score tick
function changeScoreTicks2() {
    let pNum = 1;
    if (this == p2Win2) {
        pNum = 2;
    }

    //deactivate wins 2 and 3
    document.getElementById('winP' + pNum + '-1').checked = true;
    document.getElementById('winP' + pNum + '-3').checked = false;
}
//something something the third score tick
function changeScoreTicks3() {
    let pNum = 1;
    if (this == p2Win3) {
        pNum = 2;
    }

    //deactivate wins 2 and 3
    document.getElementById('winP' + pNum + '-1').checked = true;
    document.getElementById('winP' + pNum + '-2').checked = true;
}

//returns how much score does a player have
function checkScore(tick1, tick2, tick3) {
    let totalScore = 0;

    if (tick1.checked) {
        totalScore++;
    }
    if (tick2.checked) {
        totalScore++;
    }
    if (tick3.checked) {
        totalScore++;
    }

    return totalScore;
}

//gives a victory to player 1 
function giveWinP1() {
    if (p1Win2.checked) {
        p1Win3.checked = true;
    } else if (p1Win1.checked) {
        p1Win2.checked = true;
    } else if (!p1Win1.checked) {
        p1Win1.checked = true;
    }
}
//same with P2
function giveWinP2() {
    if (p2Win2.checked) {
        p2Win3.checked = true;
    } else if (p2Win1.checked) {
        p2Win2.checked = true;
    } else if (!p2Win1.checked) {
        p2Win1.checked = true;
    }
}

function setWLP1() {
    if (this == p1W) {
        currentP1WL = "W";
        this.style.color = "var(--text1)";
        p1L.style.color = "var(--text2)";
        this.style.backgroundImage = "linear-gradient(to top, #575757, #00000000)";
        p1L.style.backgroundImage = "var(--bg4)";
    } else {
        currentP1WL = "L";
        this.style.color = "var(--text1)";
        p1W.style.color = "var(--text2)";
        this.style.backgroundImage = "linear-gradient(to top, #575757, #00000000)";
        p1W.style.backgroundImage = "var(--bg4)";
    }
}
function setWLP2() {
    if (this == p2W) {
        currentP2WL = "W";
        this.style.color = "var(--text1)";
        p2L.style.color = "var(--text2)";
        this.style.backgroundImage = "linear-gradient(to top, #575757, #00000000)";
        p2L.style.backgroundImage = "var(--bg4)";
    } else {
        currentP2WL = "L";
        this.style.color = "var(--text1)";
        p2W.style.color = "var(--text2)";
        this.style.backgroundImage = "linear-gradient(to top, #575757, #00000000)";
        p2W.style.backgroundImage = "var(--bg4)";
    }
}

function deactivateWL() {
    currentP1WL = "Nada";
    currentP2WL = "Nada";
    document.getElementById;

    pWLs = document.getElementsByClassName("wlBox");
    for (let i = 0; i < pWLs.length; i++) {
        pWLs[i].style.color = "var(--text2)";
        pWLs[i].style.backgroundImage = "var(--bg4)";
    }
}

function addStarP1() {
    if(p1StarCount.value < 7){
        p1StarCount.value = String(Number(p1StarCount.value) + 1);
    }
}

function removeStarP1() {
    if(p1StarCount.value > 0){
        p1StarCount.value = String(Number(p1StarCount.value) - 1);
    }
}

function addStarP2() {
    if(p2StarCount.value < 7){
        p2StarCount.value = String(Number(p2StarCount.value) + 1);
    }
}

function removeStarP2() {
    if(p2StarCount.value > 0){
        p2StarCount.value = String(Number(p2StarCount.value) - 1);
    }
}

function forceWLtoggles() {
    const wlButtons = document.getElementsByClassName("wlButtons");

        if (forceWL.checked) {
            for (let i = 0; i < wlButtons.length; i++) {
                wlButtons[i].style.display = "inline";
            }
        } else {
            for (let i = 0; i < wlButtons.length; i++) {
                wlButtons[i].style.display = "none";
                deactivateWL();
            }
        }
}

//same code as above but just for the player tag
function resizeInput() {
    changeInputWidth(this);
}

//changes the width of an input box depending on the text
function changeInputWidth(input) {
    input.style.width = getTextWidth(input.value,
        window.getComputedStyle(input).fontSize + " " +
        window.getComputedStyle(input).fontFamily
    ) + 12 + "px";
}


//used to get the exact width of a text considering the font used
function getTextWidth(text, font) {
    let canvas = getTextWidth.canvas || (getTextWidth.canvas = document.createElement("canvas"));
    let context = canvas.getContext("2d");
    context.font = font;
    let metrics = context.measureText(text);
    return metrics.width;
}


//used when clicking on the "Best of" buttons
function changeBestOf() {
    let theOtherBestOf1; // We need to track the other best-of
    let theOtherBestOf2; // Track another element for bo1Div

    if (this == document.getElementById("bo5Div")) {
        currentBestOf = "Bo5";
        theOtherBestOf1 = document.getElementById("bo1Div");
        theOtherBestOf2 = document.getElementById("bo3Div");
        p1Win3.style.display = "block";
        p2Win3.style.display = "block";
        p1Win2.style.display = "block";
        p2Win2.style.display = "block";
    } else if (this == document.getElementById("bo3Div")) {
        currentBestOf = "Bo3";
        theOtherBestOf1 = document.getElementById("bo1Div");
        theOtherBestOf2 = document.getElementById("bo5Div");
        // Hide or show any elements specific to "Bo1" if necessary
        p1Win3.style.display = "none";
        p2Win3.style.display = "none";
        p1Win2.style.display = "block";
        p2Win2.style.display = "block";
    } else {
        currentBestOf = "Bo1";
        theOtherBestOf1 = document.getElementById("bo3Div");
        theOtherBestOf2 = document.getElementById("bo5Div");
        p1Win3.style.display = "none";
        p2Win3.style.display = "none";
        p1Win2.style.display = "none";
        p2Win2.style.display = "none";
    }
    // Change the color and background of the buttons
    this.style.color = "var(--text1)";
    this.style.backgroundImage = "linear-gradient(to top, #575757, #00000000)";
    theOtherBestOf1.style.color = "var(--text2)";
    theOtherBestOf1.style.backgroundImage = "var(--bg4)";
    theOtherBestOf2.style.color = "var(--text2)";
    theOtherBestOf2.style.backgroundImage = "var(--bg4)";
}

function changeBRB(){
    let prevBRBStatus;
    if(this == document.getElementById("brb")) {
        prevBRBStatus = document.getElementById("back");
        currentTheme = 'ttt';
        currentBRB = true;
    } else {
        prevBRBStatus = document.getElementById("brb");
        currentBRB = false;
        currentTheme = 'ttt';
    }
    this.style.color = "var(--text1)";
    this.style.backgroundImage = "linear-gradient(to top, #575757, #00000000)";
    prevBRBStatus.style.color = "var(--text2)";
    prevBRBStatus.style.backgroundImage = "var(--bg4)";
}

function checkRound() {
    const wlButtons = document.getElementsByClassName("wlButtons");
    if (roundInp.value.toLocaleUpperCase().includes("Grand".toLocaleUpperCase())) {
        for (let i = 0; i < wlButtons.length; i++) {
            wlButtons[i].style.display = "inline";
        }
    } else {
        for (let i = 0; i < wlButtons.length; i++) {
            wlButtons[i].style.display = "none";
            deactivateWL();
        }
    }
}

function updatePlayerStyles(playerWL, playerW, playerL) {
    if (playerWL == 'W') {
        playerW.style.color = "var(--text1)";
        playerL.style.color = "var(--text2)";
        playerW.style.backgroundImage = "linear-gradient(to top, #575757, #00000000)";
        playerL.style.backgroundImage = "var(--bg4)";
    } else {
        playerL.style.color = "var(--text1)";
        playerW.style.color = "var(--text2)";
        playerL.style.backgroundImage = "linear-gradient(to top, #575757, #00000000)";
        playerW.style.backgroundImage = "var(--bg4)";
    }
}

function resetPlayerStyles(playerW, playerL) {
    playerW.style.color = "var(--text2)";
    playerL.style.color = "var(--text2)";
    playerW.style.backgroundImage = "var(--bg4)";
    playerL.style.backgroundImage = "var(--bg4)";
}

function swap() {
    // Swap Preview Images and set style accordingly
    const tmpSrc = previewImage1.src;
    previewImage1.src = previewImage2.src;
    previewImage2.src = tmpSrc;

    if (!previewImage1.src.endsWith("index.html")) {
        previewImage1.style.display = 'block';
        previewDefaultText1.style.display = 'none';
    } else {
        previewImage1.style.display = 'none';
        previewDefaultText1.style.display = 'block';
    }

    if (!previewImage2.src.endsWith("index.html")) {
        previewImage2.style.display = 'block';
        previewDefaultText2.style.display = 'none';
    } else {
        previewImage2.style.display = 'none';
        previewDefaultText2.style.display = 'block';
    }

    // Swapping W/L Status and Selections

    tempP1WL = currentP1WL;
    currentP1WL = currentP2WL;
    currentP2WL = tempP1WL;

    tempP1StarCount = p1StarCount.value;
    p1StarCount.value = p2StarCount.value;
    p2StarCount.value = tempP1StarCount;

    if (currentP1WL != "Nada" && currentP2WL != "Nada") {
        updatePlayerStyles(currentP1WL, p1W, p1L);
        updatePlayerStyles(currentP2WL, p2W, p2L);
    } else {
        if (currentP1WL == "Nada") {
            resetPlayerStyles(p1W, p1L);
        } else {
            updatePlayerStyles(currentP1WL, p1W, p1L);
        }

        if (currentP2WL == "Nada") {
            resetPlayerStyles(p2W, p2L);
        } else {
            updatePlayerStyles(currentP2WL, p2W, p2L);
        }
    }

    let tempP1Name = p1NameInp.value;
    let tempP1Team = p1TagInp.value;
    let tempP2Name = p2NameInp.value;
    let tempP2Team = p2TagInp.value;

    p1NameInp.value = tempP2Name;
    p1TagInp.value = tempP2Team;
    p2NameInp.value = tempP1Name;
    p2TagInp.value = tempP1Team;

    changeInputWidth(p1NameInp);
    changeInputWidth(p1TagInp);
    changeInputWidth(p2NameInp);
    changeInputWidth(p2TagInp);

    tempP1Score = checkScore(p1Win1, p1Win2, p1Win3);
    tempP2Score = checkScore(p2Win1, p2Win2, p2Win3);
    setScore(tempP2Score, p1Win1, p1Win2, p1Win3);
    setScore(tempP1Score, p2Win1, p2Win2, p2Win3);

    // Swap file inputs
    let tempFile = document.getElementById('file1').files;
    document.getElementById('file1').files = document.getElementById('file2').files;
    document.getElementById('file2').files = tempFile;
}

function clearPlayers() {
    //clear player texts
    p1TagInp.value = "";
    p1NameInp.value = "";
    p2TagInp.value = "";
    p2NameInp.value = "";
    changeInputWidth(p1TagInp);
    changeInputWidth(p1NameInp);
    changeInputWidth(p2TagInp);
    changeInputWidth(p2NameInp);

    //clear player scores
    let checks = document.getElementsByClassName("scoreCheck");
    for (let i = 0; i < checks.length; i++) {
        checks[i].checked = false;
    }

    // Clear player profile pictures

    removeImage1();
    removeImage2();

    resetPlayerStyles(p1W, p1L);
    resetPlayerStyles(p2W, p2L);
    currentP1WL = "Nada";
    currentP2WL = "Nada";

    p1StarCount.value = 7;
    p2StarCount.value = 7;
}

function setScore(score, tick1, tick2, tick3) {
    tick1.checked = false;
    tick2.checked = false;
    tick3.checked = false;
    if (score > 0) {
        tick1.checked = true;
        if (score > 1) {
            tick2.checked = true;
            if (score > 2) {
                tick3.checked = true;
            }
        }
    }
}

function writeStageStrikingVisualizer() {
    let stageStrikingJson = {
        displayVisualizer: movedStageStriker,
        bob: bobToggle,
        wf: wfToggle,
        jrb: jrbToggle,
        ccm: ccmToggle,
        bbh: bbhToggle,
        hmc: hmcToggle,
        lll: lllToggle,
        ssl: sslToggle,
        ddd: dddToggle,
        sl: slToggle,
        wdw: wdwToggle,
        thi: thiToggle,
        ttm: ttmToggle,
        ttc: ttcToggle,
        rr: rrToggle,
    };

    let data = JSON.stringify(stageStrikingJson, null, 2);
    fs.writeFileSync(path.join(streamToolDirectory, "Texts", "StageStrikingInfo.json"), data);
}

function writeScoreboard() {
    let p1File = document.getElementById('file1').files[0];
    let p2File = document.getElementById('file2').files[0];
    
    fetch('../resources/Stream Tool/Resources/Player Icons/black.png')
        .then(response => response.blob())
        .then(blob => {
            let defaultFile = new File([blob], 'black.png', { type: 'image/png' });
            // console.log(defaultFile); // Check if the file is loaded correctly

            let scoreboardJson = {
                p1Name: p1NameInp.value,
                p1Team: p1TagInp.value,
                p1Pic: p1File ? p1File.lastModified : "",
                p1Score: checkScore(p1Win1, p1Win2, p1Win3),
                p1WL: currentP1WL,
                p1StarCount: p1StarCount.value,                p2Name: p2NameInp.value,
                p2Team: p2TagInp.value,
                p2Pic: p2File ? p2File.lastModified : "",
                p2Score: checkScore(p2Win1, p2Win2, p2Win3),
                p2WL: currentP2WL,
                p2StarCount: p2StarCount.value,
                bestOf: currentBestOf,
                round: roundInp.value,
                tournamentName: document.getElementById('tournamentName').value,
                caster1Name: document.getElementById('cName1').value,
                caster1Bluesky: document.getElementById('cbsky1').value,
                caster1Twitch: document.getElementById('cTwitch1').value,
                caster2Name: document.getElementById('cName2').value,
                caster2Bluesky: document.getElementById('cbsky2').value,
                caster2Twitch: document.getElementById('cTwitch2').value,
                caster3Name: document.getElementById('cName3').value,
                caster3Bluesky: document.getElementById('cbsky3').value,
                caster3Twitch: document.getElementById('cTwitch3').value,
                timerStatus: timerOn,
                theme: currentTheme,
                brb: currentBRB,
            };

            let data = JSON.stringify(scoreboardJson, null, 2);


            fs.writeFileSync(path.join(streamToolDirectory, "Texts", "ScoreboardInfo.json"), data);
            // fuck YOU we're not doing it this way anymore pal
            // fs.writeFileSync(path.join(streamToolDirectory, "Texts", "ScoreboardInfo copy.json"), data);

            //simple .txt files
            fs.writeFileSync(path.join(textsFolder, "Player 1.txt"), p1NameInp.value);
            fs.writeFileSync(path.join(textsFolder, "Player 2.txt"), p2NameInp.value);

            fs.writeFileSync(path.join(textsFolder, "Round.txt"), roundInp.value);
            fs.writeFileSync(path.join(textsFolder, "Tournament Name.txt"), document.getElementById('tournamentName').value);

            fs.writeFileSync(path.join(textsFolder, "Caster 1 Name.txt"), document.getElementById('cName1').value);
            fs.writeFileSync(path.join(textsFolder, "Caster 1 Bluesky.txt"), document.getElementById('cbsky1').value);
            fs.writeFileSync(path.join(textsFolder, "Caster 1 Twitch.txt"), document.getElementById('cTwitch1').value);

            fs.writeFileSync(path.join(textsFolder, "Caster 2 Name.txt"), document.getElementById('cName2').value);
            fs.writeFileSync(path.join(textsFolder, "Caster 2 Bluesky.txt"), document.getElementById('cbsky2').value);
            fs.writeFileSync(path.join(textsFolder, "Caster 2 Twitch.txt"), document.getElementById('cTwitch2').value);

            fs.writeFileSync(path.join(textsFolder, "Caster 3 Name.txt"), document.getElementById('cName3').value);
            fs.writeFileSync(path.join(textsFolder, "Caster 3 Bluesky.txt"), document.getElementById('cbsky3').value);
            fs.writeFileSync(path.join(textsFolder, "Caster 3 Twitch.txt"), document.getElementById('cTwitch3').value);
            
            // Copy p1File and p2File to another directory
            const copyFile = (file, defaultFile, filePath) => {
                let reader = new FileReader();
                reader.onload = function (event) {
                    let buffer = new Uint8Array(event.target.result);
                    window.electron.fs.writeFileSync(filePath, buffer);
                };
                if (!file) {
                    reader.readAsArrayBuffer(defaultFile);
                } else {
                    reader.readAsArrayBuffer(file);
                }
            };

            let p1FilePath = window.electron.path.join(streamToolDirectory, "Player Icons", "p1.png");
            copyFile(p1File, defaultFile, p1FilePath);

            let p2FilePath = window.electron.path.join(streamToolDirectory, "Player Icons", "p2.png");
            copyFile(p2File, defaultFile, p2FilePath);
        })
        .catch(error => console.error('Error loading default file:', error));
}