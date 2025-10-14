//animation stuff
const pMove = 20; //distance to move for most of the animations
const sMove = 40; //distance for the score assets

const fadeInTime = .3; //(seconds)
const fadeOutTime = .2;
let introDelay = .8; //all animations will get this delay when the html loads (use this so it times with your transition)

// list of all stage theme classes used on the background element
const STAGE_THEMES = [
	'ttt','bob','wf','jrb','ccm','bbh','hmc','lll','ssl','ddd','sl','wdw','thi','ttm','ttc','rr'
];

// helper to remove all stage theme classes and then (optionally) add the requested theme
function applyBackgroundTheme(theme) {
	const theBackground = document.getElementById('theBackground');
	if (!theBackground) return;

	// figure out which of the known stage themes are currently applied
	const appliedThemes = STAGE_THEMES.filter(t => theBackground.classList.contains(t));

	// if nothing would change (already has exactly the requested theme, or no theme requested and none present), skip
	const alreadyHasRequested = (theme && appliedThemes.length === 1 && appliedThemes[0] === theme) || (!theme && appliedThemes.length === 0);
	if (alreadyHasRequested) return;


	// create the clone
	const clone = theBackground.cloneNode(true);
	clone.id = 'theBackground-clone';

	// remove the circles/list of animated icons from the clone so animated icons
	// currently on-screen are not replaced or covered during the crossfade.
	const cloneCircles = clone.querySelector('.circles');
	if (cloneCircles && cloneCircles.parentNode) {
		cloneCircles.parentNode.removeChild(cloneCircles);
	}
	// ensure clone is positioned absolutely on top of the original
	clone.style.position = 'absolute';
	clone.style.top = theBackground.offsetTop + 'px';
	clone.style.left = theBackground.offsetLeft + 'px';
	clone.style.width = theBackground.offsetWidth + 'px';
	clone.style.height = theBackground.offsetHeight + 'px';
	clone.style.pointerEvents = 'none';
	clone.style.opacity = 0;
	// copy mask styles from the original so the clone is masked the same way
	try {
		const computed = window.getComputedStyle(theBackground);
		const webkitMaskImage = computed.getPropertyValue('-webkit-mask-image');
		const maskImage = computed.getPropertyValue('mask-image');
		if (webkitMaskImage) clone.style.webkitMaskImage = webkitMaskImage;
		if (maskImage) clone.style.maskImage = maskImage;

		const webkitMaskSize = computed.getPropertyValue('-webkit-mask-size');
		const maskSize = computed.getPropertyValue('mask-size');
		if (webkitMaskSize) clone.style.webkitMaskSize = webkitMaskSize;
		if (maskSize) clone.style.maskSize = maskSize;

		const webkitMaskRepeat = computed.getPropertyValue('-webkit-mask-repeat');
		const maskRepeat = computed.getPropertyValue('mask-repeat');
		if (webkitMaskRepeat) clone.style.webkitMaskRepeat = webkitMaskRepeat;
		if (maskRepeat) clone.style.maskRepeat = maskRepeat;

		const webkitMaskPosition = computed.getPropertyValue('-webkit-mask-position');
		const maskPosition = computed.getPropertyValue('mask-position');
		if (webkitMaskPosition) clone.style.webkitMaskPosition = webkitMaskPosition;
		if (maskPosition) clone.style.maskPosition = maskPosition;
	} catch (e) {
		// getComputedStyle might fail in some older environments; if so, skip copying mask styles
	}
	// apply theme classes to clone: remove other stage classes first
	STAGE_THEMES.forEach(t => clone.classList.remove(t));
	if (theme) clone.classList.add(theme);

	// insert clone right after the original in the DOM so it overlays (same parent)
	theBackground.parentNode.insertBefore(clone, theBackground.nextSibling);

	// animate: fade clone in and original out simultaneously
	const fadeDurationIn = 0.35;
	const fadeDurationOut = 0.25;

	gsap.to(clone, {opacity: 1, duration: fadeDurationIn, ease: 'power2.out'});
	gsap.to(theBackground, {
		opacity: 0,
		duration: fadeDurationOut,
		ease: 'power1.in',
		onComplete: () => {
			// swap classes on the original element
			STAGE_THEMES.forEach(t => theBackground.classList.remove(t));
			if (theme) theBackground.classList.add(theme);
			// restore original opacity and remove clone
			theBackground.style.opacity = 1;
			if (clone && clone.parentNode) clone.parentNode.removeChild(clone);
		}
	});
}

//to avoid the code constantly running the same method over and over
let p1ScorePrev, p1wlPrev;
let p2ScorePrev, p2wlPrev;
let bestOfPrev;
let timerTogglePrev;

//
let p1Pic, p1PicPrev;
let p2Pic, p2PicPrev;

//max text sizes (used when resizing back)
const tournamentSize = '32px';
const roundSize = '28px';
const casterSize = '24px';
const bskySize = '20px';

//variables for the bsky/twitch constant change
let socialInt1;
let socialInt2;
let bluesky1, twitch1, bluesky2, twitch2;
let socialSwitch = true; //true = bsky, false = twitch
const socialInterval = 12000;

let startup = true;

// Timer things

const timerDisplay = document.getElementById('timer');
let startTime = 0;
let elapsedTime = 0;
let isRunning = false;
let countedDown = false;
let stopped = false;
let timer = null;
let countdownTimer;
let remainingTime;

const timerFolder = 'Resources/Texts/Timer Info';

window.onload = init;

function init() {
	async function mainLoop() {
		const scInfo = await getInfo();
		const stageInfo = await getStageInfo();
		getData(scInfo, stageInfo);
	}

	mainLoop();
	setInterval( () => { mainLoop(); readTimerFiles(); }, 500); //update interval
	
}

async function getData(scInfo, stageInfo) {
	let p1Name = scInfo['p1Name'];
	let p1Team = scInfo['p1Team'];
	let p1Score = scInfo['p1Score'];

	let p1WL = scInfo['p1WL'];
	
	let p2Name = scInfo['p2Name'];
	let p2Team = scInfo['p2Team'];
	let p2Score = scInfo['p2Score'];

	let p2WL = scInfo['p2WL'];

	let tournament = scInfo['tournamentName']
	let round = scInfo['round'];
	let bestOf = scInfo['bestOf'];

	let caster1 = scInfo['caster1Name'];
	bluesky1 = scInfo['caster1Bluesky'];
	twitch1 = scInfo['caster1Twitch'];
	let caster2 = scInfo['caster2Name'];
	bluesky2 = scInfo['caster2Bluesky'];
	twitch2 = scInfo['caster2Twitch'];

	let theme = scInfo['theme'];

	// Player Pic Info
	let p1Pic = scInfo['p1Pic'];
	let p2Pic = scInfo['p2Pic'];

	let timerToggle = scInfo['timerStatus'];

	let displayStageStriker = stageInfo['displayVisualizer'];
	let bob = stageInfo['bob'];
	let wf = stageInfo['wf'];
	let jrb = stageInfo['jrb'];
	let ccm = stageInfo['ccm'];
	let bbh = stageInfo['bbh'];
	let hmc = stageInfo['hmc'];
	let lll = stageInfo['lll'];
	let ssl = stageInfo['ssl'];
	let ddd = stageInfo['ddd'];
	let sl = stageInfo['sl'];
	let wdw = stageInfo['wdw'];
	let ttm = stageInfo['ttm'];
	let thi = stageInfo['thi'];
	let ttc = stageInfo['ttc'];
	let rr = stageInfo['rr'];


	//first, things that will happen only the first time the html loads
	if (startup) {
		
		//update player name and team name texts
		updatePlayerName('p1Wrapper', 'p1Name', 'p1Team', p1Name, p1Team);
		//sets the starting position for the player text, then fades in and moves the p1 text to the next keyframe
		gsap.fromTo("#p1Wrapper", 
			{x: -pMove}, //from
			{delay: introDelay+.1, x: 0, opacity: 1, ease: "power2.out", duration: fadeInTime}); //to

		//if its grands, we need to show the [W] and/or the [L] on the players
		await updatePlayerPic('p1PlayerPic', 1);
		initPicFade("#p1PlayerPic");
		p1PicPrev = p1Pic;
		updateWL(p1WL, "1");
		//save for later so the animation doesn't repeat over and over
		p1wlPrev = p1WL;

		//set the current score
		updateScore(1, p1Score);
		moveScoresIntro(1, bestOf, p1WL, sMove);

		p1ScorePrev = p1Score;


		resizeText(document.getElementById('timerWrapper'));
		updatePlayerName('p2Wrapper', 'p2Name', 'p2Team', p2Name, p2Team);
		gsap.fromTo("#p2Wrapper", 
			{x: pMove},
			{delay: introDelay+.1, x: 0, opacity: 1, ease: "power2.out", duration: fadeInTime});

		updateWL(p2WL, "2");
		await updatePlayerPic('p2PlayerPic', 2);
		initPicFade("#p2PlayerPic");
		p2PicPrev = p2Pic;
		p2wlPrev = p2WL;

		updateScore(2, p2Score);
		moveScoresIntro(2, bestOf, p2WL, -sMove);
		p2ScorePrev = p2Score;

		// //set this for later
		bestOfPrev = bestOf;
		timerTogglePrev = timerToggle;
		// TODO make the function that animates the timer background in and out

		updateTournament(tournament);
		document.getElementById('tournamentName').textContext = tournament;
		// console.log(tournament);
		// update the round text
		updateRound(round);
		//update the best of text
		if (bestOf == "Bo5") {
			document.getElementById('bestOf').textContent = "Best of 5";
		} else if (bestOf == "Bo3") {
            document.getElementById('bestOf').textContent = "Best of 3";
        } else {
			document.getElementById('bestOf').textContent = "Best of 1";
		}
		//fade them in (but only if round text is not empty)
		if (round != "") {
			gsap.to("#overlayRound", {delay: introDelay, opacity: 1, ease: "power2.out", duration: fadeInTime+.2});
		}

		if(tournament != "") {
			gsap.to("#overlayTournament",{delay: introDelay, opacity: 1, ease: "power2.out", duration: fadeInTime+.2});
		}

		//set the caster info
		updateSocialText("caster1N", caster1, casterSize, "caster1TextBox");
		updateSocialText("caster1Tr", bluesky1, bskySize, "caster1BlueskyBox");
		updateSocialText("caster1Th", twitch1, bskySize, "caster1TwitchBox");
		updateSocialText("caster2N", caster2, casterSize, "caster2TextBox");
		updateSocialText("caster2Tr", bluesky2, bskySize, "caster2BlueskyBox");
		updateSocialText("caster2Th", twitch2, bskySize, "caster2TwitchBox");

		
		// setup bluesky/twitch change
		socialChange1("caster1BlueskyBox", "caster1TwitchBox");
		socialChange2("caster2BlueskyBox", "caster2TwitchBox");
		// set an interval to keep changing the names
		socialInt1 = setInterval( () => {
			socialChange1("caster1BlueskyBox", "caster1TwitchBox");
		}, socialInterval);
		socialInt2 = setInterval(() => {
			socialChange2("caster2BlueskyBox", "caster2TwitchBox");
		}, socialInterval);

		//keep changing this boolean for the previous intervals
		setInterval(() => {
			if (socialSwitch) { //true = bluesky, false = twitch
				socialSwitch = false;
			} else {
				socialSwitch = true;
			}
		}, socialInterval);

		//if a caster has no name, hide its icon
		if (caster1 == "") {
			document.getElementById('caster1Icon').style.opacity = 0;
		} else {
			fadeIn("#caster1TextBox", .2);
			fadeIn("#caster1Icon", .2);
		}
		if (caster2 == "") {
			document.getElementById('caster2Icon').style.opacity = 0;
		} else {
			fadeIn("#caster2TextBox", .2);
			fadeIn("#caster2Icon", .2);
		}

		gsap.to("#overlayTimer", {y: -pMove, opacity: 0, ease: "power1.in", duration: fadeOutTime, onComplete: timerMoved});
			function timerMoved() {
				if (timerToggle != false) {
					gsap.to("#overlayTimer", {delay: .3, y: 0, opacity: 1, ease: "power2.out", duration: fadeInTime});
				} else {
					gsap.to("#overlayTimer", {y: 0, duration: fadeInTime});
				}
			}

		startup = false; //next time we run this function, it will skip all we just did
	}

	//now things that will happen constantly
	else {
		if(displayStageStriker){
			gsap.to("#stageStriker", {display: 'block', opacity: 1, duration: fadeInTime});
		} else {
			gsap.to("#stageStriker", {opacity: 0, duration: .45, onComplete: () => {
				document.getElementById('stageStriker').style.display = 'none';
			}});
		}
		// resizeText(document.getElementById(timerWrapper));
		if (document.getElementById('p1Name').textContent != p1Name ||
			document.getElementById('p1Team').textContent != p1Team) {
			fadeOutMove("#p1Wrapper", -pMove, () => {
				updatePlayerName('p1Wrapper', 'p1Name', 'p1Team', p1Name, p1Team);
				fadeInMove("#p1Wrapper");
			});
		}
		
		// ensure only the requested stage theme is applied — clear other stage classes first
		applyBackgroundTheme(theme);
		const bobImg = document.getElementById('bob').querySelector('img');
		if (bob) {
			gsap.to(bobImg, { filter: "grayscale(1)", duration: 0.4, ease: "power2.out" });
		} else {
			gsap.to(bobImg, { filter: "grayscale(0)", duration: 0.4, ease: "power2.out" });
		}
		const wfImg = document.getElementById('wf').querySelector('img');
		if (wf) {
			gsap.to(wfImg, { filter: "grayscale(1)", duration: 0.4, ease: "power2.out" });
		} else {
			gsap.to(wfImg, { filter: "grayscale(0)", duration: 0.4, ease: "power2.out" });
		}
		const jrbImg = document.getElementById('jrb').querySelector('img');
		if (jrb) {
			gsap.to(jrbImg, { filter: "grayscale(1)", duration: 0.4, ease: "power2.out" });
		} else {
			gsap.to(jrbImg, { filter: "grayscale(0)", duration: 0.4, ease: "power2.out" });
		}
		const ccmImg = document.getElementById('ccm').querySelector('img');
		if (ccm) {
			gsap.to(ccmImg, { filter: "grayscale(1)", duration: 0.4, ease: "power2.out" });
		} else {
			gsap.to(ccmImg, { filter: "grayscale(0)", duration: 0.4, ease: "power2.out" });
		}
		const bbhImg = document.getElementById('bbh').querySelector('img');
		if (bbh) {
			gsap.to(bbhImg, { filter: "grayscale(1)", duration: 0.4, ease: "power2.out" });
		} else {
			gsap.to(bbhImg, { filter: "grayscale(0)", duration: 0.4, ease: "power2.out" });
		}
		const hmcImg = document.getElementById('hmc').querySelector('img');
		if (hmc) {
			gsap.to(hmcImg, { filter: "grayscale(1)", duration: 0.4, ease: "power2.out" });
		} else {
			gsap.to(hmcImg, { filter: "grayscale(0)", duration: 0.4, ease: "power2.out" });
		}
		const lllImg = document.getElementById('lll').querySelector('img');
		if (lll) {
			gsap.to(lllImg, { filter: "grayscale(1)", duration: 0.4, ease: "power2.out" });
		} else {
			gsap.to(lllImg, { filter: "grayscale(0)", duration: 0.4, ease: "power2.out" });
		}
		const sslImg = document.getElementById('ssl').querySelector('img');
		if (ssl) {
			gsap.to(sslImg, { filter: "grayscale(1)", duration: 0.4, ease: "power2.out" });
		} else {
			gsap.to(sslImg, { filter: "grayscale(0)", duration: 0.4, ease: "power2.out" });
		}
		const dddImg = document.getElementById('ddd').querySelector('img');
		if (ddd) {
			gsap.to(dddImg, { filter: "grayscale(1)", duration: 0.4, ease: "power2.out" });
		} else {
			gsap.to(dddImg, { filter: "grayscale(0)", duration: 0.4, ease: "power2.out" });
		}
		const slImg = document.getElementById('sl').querySelector('img');
		if (sl) {
			gsap.to(slImg, { filter: "grayscale(1)", duration: 0.4, ease: "power2.out" });
		} else {
			gsap.to(slImg, { filter: "grayscale(0)", duration: 0.4, ease: "power2.out" });
		}
		const wdwImg = document.getElementById('wdw').querySelector('img');
		if (wdw) {
			gsap.to(wdwImg, { filter: "grayscale(1)", duration: 0.4, ease: "power2.out" });
		} else {
			gsap.to(wdwImg, { filter: "grayscale(0)", duration: 0.4, ease: "power2.out" });
		}
		const ttmImg = document.getElementById('ttm').querySelector('img');
		if (ttm) {
			gsap.to(ttmImg, { filter: "grayscale(1)", duration: 0.4, ease: "power2.out" });
		} else {
			gsap.to(ttmImg, { filter: "grayscale(0)", duration: 0.4, ease: "power2.out" });
		}
		const thiImg = document.getElementById('thi').querySelector('img');
		if (thi) {
			gsap.to(thiImg, { filter: "grayscale(1)", duration: 0.4, ease: "power2.out" });
		} else {
			gsap.to(thiImg, { filter: "grayscale(0)", duration: 0.4, ease: "power2.out" });
		}
		const ttcImg = document.getElementById('ttc').querySelector('img');
		if (ttc) {
			gsap.to(ttcImg, { filter: "grayscale(1)", duration: 0.4, ease: "power2.out" });
		} else {
			gsap.to(ttcImg, { filter: "grayscale(0)", duration: 0.4, ease: "power2.out" });
		}
		const rrImg = document.getElementById('rr').querySelector('img');
		if (rr) {
			gsap.to(rrImg, { filter: "grayscale(1)", duration: 0.4, ease: "power2.out" });
		} else {
			gsap.to(rrImg, { filter: "grayscale(0)", duration: 0.4, ease: "power2.out" });
		}
		

		//player 1's character portrait change
		if (p1PicPrev != p1Pic) {
			fadeOutPic("#p1PlayerPic", 0, async () => {
				updatePlayerPic('p1PlayerPic', 1); //will return scale
				fadeInPic("#p1PlayerPic");
			});
			p1PicPrev = p1Pic;
		}
		
		if(timerTogglePrev != timerToggle){
			gsap.to("#overlayTimer", {y: -pMove, opacity: 0, ease: "power1.in", duration: fadeOutTime, onComplete: timerMoved});
			function timerMoved() {
				if (timerToggle != false) {
					gsap.to("#overlayTimer", {delay: .3, y: 0, opacity: 1, ease: "power2.out", duration: fadeInTime});
				} else {
					gsap.to("#overlayTimer", {y: 0, duration: fadeInTime});
				}
			}
			timerTogglePrev = timerToggle;
		}
		//the [W] and [L] status for grand finals
		if (p1wlPrev != p1WL) {
			gsap.to("#wlP1", {x: -pMove, opacity: 0, ease: "power1.in", duration: fadeOutTime, onComplete: pwlMoved});
			function pwlMoved() {
				updateWL(p1WL, 1);
				if (p1WL != "Nada") {
					gsap.to("#wlP1", {delay: .3, x: 0, opacity: 1, ease: "power2.out", duration: fadeInTime});
				} else {
					gsap.to("#wlP1", {x: 0, duration: fadeInTime});
				}
			}
			p1wlPrev = p1WL;
		}


		//score check
		if (p1ScorePrev != p1Score) {
			updateScore(1, p1Score);
			p1ScorePrev = p1Score;
		}

		if (document.getElementById('p2Name').textContent != p2Name ||
			document.getElementById('p2Team').textContent != p2Team){
			fadeOutMove("#p2Wrapper", pMove, () => {
				updatePlayerName('p2Wrapper', 'p2Name', 'p2Team', p2Name, p2Team);
				fadeInMove("#p2Wrapper");
			});
		}


		//player 2's character portrait change
		if (p2PicPrev != p2Pic) {
			fadeOutPic("#p2PlayerPic", 0, async () => {
				updatePlayerPic('p2PlayerPic', 2); 
				fadeInPic("#p2PlayerPic");
			});
			p2PicPrev = p2Pic;
		}

		if (p2wlPrev != p2WL) {
			gsap.to("#wlP2", {x: pMove, opacity: 0, ease: "power1.in", duration: fadeOutTime, onComplete: pwlMoved});
			function pwlMoved() {
				updateWL(p2WL, 2);
				if (p2WL != "Nada") {
					gsap.to("#wlP2", {delay: .3, x: 0, opacity: 1, ease: "power2.out", duration: fadeInTime});
				} else {
					gsap.to("#wlP2", {x: 0, duration: fadeInTime});
				}
			}
			p2wlPrev = p2WL;
		}

		if (p2ScorePrev != p2Score) {
			updateScore(2, p2Score);
			p2ScorePrev = p2Score;
		}

		// hide or show score ticks depending of the Best Of status
		if (bestOfPrev != bestOf) {
			if (bestOf == "Bo5") {
				if(bestOfPrev == "Bo3") {
                    gsap.fromTo('#win3P1',
                        {x: -pMove},
                        {x: 0, opacity: 1, ease: "power2.out", duration: fadeInTime});
                    gsap.fromTo('#win3P2',
                        {x: pMove},
                        {x: 0, opacity: 1, ease: "power2.out", duration: fadeInTime});
                    
                    fadeOut("#bestOf", () => {
                        document.getElementById('bestOf').textContent = "Best of 5";
                        fadeIn("#bestOf");
                    });
                } else if (bestOfPrev == "Bo1") {
                    gsap.fromTo('#win3P1',
                        {x: -pMove},
                        {x: 0, opacity: 1, ease: "power2.out", duration: fadeInTime});
                    gsap.fromTo('#win3P2',
                        {x: pMove},
                        {x: 0, opacity: 1, ease: "power2.out", duration: fadeInTime});
                    gsap.fromTo('#win2P1',
                        {x: -pMove},
                        {x: 0, opacity: 1, ease: "power2.out", duration: fadeInTime});
                    gsap.fromTo('#win2P2',
                        {x: pMove},
                        {x: 0, opacity: 1, ease: "power2.out", duration: fadeInTime});
                    fadeOut("#bestOf", () => {
                        document.getElementById('bestOf').textContent = "Best of 5";
                        fadeIn("#bestOf");
                    });
                } else {
					gsap.fromTo('#win3P1',
                        {x: -pMove},
                        {x: 0, opacity: 1, ease: "power2.out", duration: fadeInTime});
                    gsap.fromTo('#win3P2',
                        {x: pMove},
                        {x: 0, opacity: 1, ease: "power2.out", duration: fadeInTime});
                    gsap.fromTo('#win2P1',
                        {x: -pMove},
                        {x: 0, opacity: 1, ease: "power2.out", duration: fadeInTime});
                    gsap.fromTo('#win2P2',
                        {x: pMove},
                        {x: 0, opacity: 1, ease: "power2.out", duration: fadeInTime});
					gsap.fromTo('#win1P1',
						{x: -pMove},
						{x: 0, opacity: 1, ease: "power2.out", duration: fadeInTime});
					gsap.fromTo('#win1P2',
						{x: pMove},
						{x: 0, opacity: 1, ease: "power2.out", duration: fadeInTime});
                    fadeOut("#bestOf", () => {
                        document.getElementById('bestOf').textContent = "Best of 5";
                        fadeIn("#bestOf");
                    });
				}
			} else if (bestOf == "Bo3") {
                if(bestOfPrev == "Bo5"){
                    gsap.to('#win3P1',
                        {x: -pMove, opacity: 0, ease: "power2.in", duration: fadeInTime});
                    gsap.to('#win3P2',
                        {x: pMove, opacity: 0, ease: "power2.in", duration: fadeInTime});
                    fadeOut("#bestOf", () => {
                        document.getElementById('bestOf').textContent = "Best of 3";
                        fadeIn("#bestOf");
                    });
                } else if(bestOfPrev == "Bo1") {
                    gsap.fromTo('#win2P1',
                        {x: -pMove},
                        {x: 0, opacity: 1, ease: "power2.out", duration: fadeInTime});
                    gsap.fromTo('#win2P2',
                        {x: pMove},
                        {x: 0, opacity: 1, ease: "power2.out", duration: fadeInTime});
                    fadeOut("#bestOf", () => {
                        document.getElementById('bestOf').textContent = "Best of 3";
                        fadeIn("#bestOf");
                    });
                } else {
                    gsap.fromTo('#win2P1',
                        {x: -pMove},
                        {x: 0, opacity: 1, ease: "power2.out", duration: fadeInTime});
                    gsap.fromTo('#win2P2',
                        {x: pMove},
                        {x: 0, opacity: 1, ease: "power2.out", duration: fadeInTime});
					gsap.fromTo('#win1P1',
						{x: -pMove},
						{x: 0, opacity: 1, ease: "power2.out", duration: fadeInTime});
					gsap.fromTo('#win1P2',
						{x: pMove},
						{x: 0, opacity: 1, ease: "power2.out", duration: fadeInTime});	
					fadeOut("#bestOf", () => {
						document.getElementById('bestOf').textContent = "Best of 3";
						fadeIn("#bestOf");
					});				
				}
			} else {
                if(bestOfPrev == "Bo5") {
                    gsap.to('#win3P1',
                        {x: -pMove, opacity: 0, ease: "power2.in", duration: fadeInTime});
                    gsap.to('#win3P2',
                        {x: pMove, opacity: 0, ease: "power2.in", duration: fadeInTime});
                    gsap.to('#win2P1',
                        {x: -pMove, opacity: 0, ease: "power2.in", duration: fadeInTime});
                    gsap.to('#win2P2',
                        {x: pMove, opacity: 0, ease: "power2.in", duration: fadeInTime});
                    fadeOut("#bestOf", () => {
                        document.getElementById('bestOf').textContent = "Best of 1";
                        fadeIn("#bestOf");
                    });
                } else if (bestOfPrev == "Bo3") {
                    gsap.to('#win2P1',
                        {x: -pMove, opacity: 0, ease: "power2.in", duration: fadeInTime});
                    gsap.to('#win2P2',
                        {x: pMove, opacity: 0, ease: "power2.in", duration: fadeInTime});
                    fadeOut("#bestOf", () => {
                        document.getElementById('bestOf').textContent = "Best of 1";
                        fadeIn("#bestOf");
                    });
                } else {
					gsap.fromTo('#win1P1',
						{x: -pMove},
						{x: 0, opacity: 1, ease: "power2.out", duration: fadeInTime});
					gsap.fromTo('#win1P2',
						{x: pMove},
						{x: 0, opacity: 1, ease: "power2.out", duration: fadeInTime});
                    fadeOut("#bestOf", () => {
                        document.getElementById('bestOf').textContent = "Best of 5";
                        fadeIn("#bestOf");
                    });
				}
            }
			bestOfPrev = bestOf;
		}

		if (document.getElementById('tournamentName').textContent != tournament){
			fadeOut("#overlayTournament", () => {
				updateTournament(tournament);
				if (tournament != "") {
					fadeIn("#overlayTournament");
				}
			});
		}

		//update the round text
		if (document.getElementById('round').textContent != round){
			fadeOut("#overlayRound", () => {
				updateRound(round);
				if (round != "") {
					fadeIn("#overlayRound");
				}
			});
		}


		//update caster 1 info
		if (document.getElementById('caster1N').textContent != caster1){
			fadeOut("#caster1TextBox", () => {
				updateSocialText("caster1N", caster1, casterSize, 'caster1TextBox');
				//if no caster name, dont fade in the caster icon
				if (caster1 != "") {
					fadeIn("#caster1TextBox", .2);
					fadeIn("#caster1Icon", .2);
				}
			});
		}
		//caster 1's bsky
		if (document.getElementById('caster1Tr').textContent != bluesky1){
			updateSocial(bluesky1, "caster1Tr", "caster1BlueskyBox", twitch1, "caster1TwitchBox");
		}
		//caster 1's twitch (same as above)
		if (document.getElementById('caster1Th').textContent != twitch1){
			updateSocial(twitch1, "caster1Th", "caster1TwitchBox", bluesky1, "caster1BlueskyBox");
		}

		//caster 2, same as above
		if (document.getElementById('caster2N').textContent != caster2){
			fadeOut("#caster2TextBox", () => {
				updateSocialText("caster2N", caster2, casterSize, 'caster2TextBox');
				if (caster2 != "") {
					fadeIn("#caster2TextBox", .2);
					fadeIn("#caster2Icon", .2);
				}
			});
		}
		if (document.getElementById('caster2Tr').textContent != bluesky2){
			updateSocial(bluesky2, "caster2Tr", "caster2BlueskyBox", twitch2, "caster2TwitchBox");
		}

		if (document.getElementById('caster2Th').textContent != twitch2){
			updateSocial(twitch2, "caster2Th", "caster2TwitchBox", bluesky2, "caster2BlueskyBox");
		}
	}
}

//score change, pretty simple
function updateScore(pNum, pScore) {
	const score1EL = document.getElementById('win1P'+pNum);
	const score2EL = document.getElementById('win2P'+pNum);
	const score3EL = document.getElementById('win3P'+pNum);


	if (pScore >= 1) {
		scoreChange(score1EL, "#ffffff");
	} else if (score1EL.style.fill != "rgb(211, 130, 37)") {
		scoreChange(score1EL, "#000000");
	}
	if (pScore >= 2) {
		scoreChange(score2EL, "#ffffff");
	} else if (score2EL.style.fill != "rgb(211, 130, 37)") {
		scoreChange(score2EL, "#000000");
	}
	if (pScore == 3) {
		scoreChange(score3EL, "#ffffff");
	} else if (score3EL.style.fill != "rgb(211, 130, 37)") {
		scoreChange(score3EL, "#000000");
	}
}
function scoreChange(scoreEL, color) {
	// gsap.to(scoreEL, {fill: "#ffffff", duration: fadeInTime})
	gsap.to(scoreEL, {delay: fadeInTime, fill: color, duration: fadeInTime})
}

// //updates the player's text and portrait background colors
// function updateColor(colorID, textID, pColor) {
// 	const colorEL = document.getElementById(colorID);
// 	const textEL = document.getElementById(textID);

// 	gsap.to(colorEL, {backgroundColor: getHexColor(pColor), duration: fadeInTime});
// 	gsap.to(textEL, {color: getHexColor(pColor), duration: fadeInTime});
// }

function updateBorder(bestOf) {
	document.getElementById('borderP1').setAttribute('src', 'Resources/Overlay/Border ' + bestOf + '.png');
	document.getElementById('borderP2').setAttribute('src', 'Resources/Overlay/Border ' + bestOf + '.png');
	bestOfPrev = bestOf
}

//the logic behind the bluesky/twitch constant change
function socialChange1(blueskyWrapperID, twitchWrapperID) {

	const blueskyWrapperEL = document.getElementById(blueskyWrapperID);
	const twitchWrapperEL = document.getElementById(twitchWrapperID);

	if (startup) {

		//if first time, set initial opacities so we can read them later
		if (!bluesky1 && !twitch1) { //if all blank
			blueskyWrapperEL.style.opacity = 0;
			twitchWrapperEL.style.opacity = 0;
		} else if (!bluesky1 && !!twitch1) { //if bsky blank
			blueskyWrapperEL.style.opacity = 0;
			twitchWrapperEL.style.opacity = 1;
		} else {
			blueskyWrapperEL.style.opacity = 1;
			twitchWrapperEL.style.opacity = 0;
		}
		

	} else if (!!bluesky1 && !!twitch1) {

		if (socialSwitch) {
			fadeOut(blueskyWrapperEL, () => {
				fadeIn(twitchWrapperEL, 0);
			});
		} else {
			fadeOut(twitchWrapperEL, () => {
				fadeIn(blueskyWrapperEL, 0);
			});
		}

	}
}
//i didnt know how to make it a single function im sorry ;_;
function socialChange2(blueskyWrapperID, twitchWrapperID) {

	const blueskyWrapperEL = document.getElementById(blueskyWrapperID);
	const twitchWrapperEL = document.getElementById(twitchWrapperID);

	if (startup) {

		if (!bluesky2 && !twitch2) {
			blueskyWrapperEL.style.opacity = 0;
			twitchWrapperEL.style.opacity = 0;
		} else if (!bluesky2 && !!twitch2) {
			blueskyWrapperEL.style.opacity = 0;
			twitchWrapperEL.style.opacity = 1;
		} else {
			blueskyWrapperEL.style.opacity = 1;
			twitchWrapperEL.style.opacity = 0;
		}

	} else if (!!bluesky2 && !!twitch2) {

		if (socialSwitch) {
			fadeOut(blueskyWrapperEL, () => {
				fadeIn(twitchWrapperEL, 0);
			});
		} else {
			fadeOut(twitchWrapperEL, () => {
				fadeIn(blueskyWrapperEL, 0);
			});
		}

	}
}
//function to decide when to change to what
function updateSocial(mainSocial, mainText, mainBox, otherSocial, otherBox) {
	//check if this is for twitch or bluesky
	let localSwitch = socialSwitch;
	if (mainText == "caster1Th" || mainText == "caster2Th") {
		localSwitch = !localSwitch;
	}
	//check if this is their turn so we fade out the other one
	if (localSwitch) {
		fadeOut("#"+otherBox, () => {})
	}

	//now do the classics
	fadeOut("#"+mainBox, () => {
		updateSocialText(mainText, mainSocial, bskySize, mainBox);
		//check if its bluesky's turn to show up
		if (otherSocial == "" && mainSocial != "") {
			fadeIn("#"+mainBox, .2);
		} else if (localSwitch && mainSocial != "") {
			fadeIn("#"+mainBox, .2);
		} else if (otherSocial != "") {
			fadeIn("#"+otherBox, .2);
		}
	});
}

//player text change
function updatePlayerName(wrapperID, nameID, teamID, pName, pTeam) {
    const nameEL = document.getElementById(nameID);
    // console.log(nameEL); // Check if the element is found
    nameEL.style.fontSize = '30px'; //set original text size
    nameEL.textContent = pName; //change the actual text
    nameEL.style.color = 'rgb(0, 0, 0)'; // change color
    // console.log(nameEL.style.color); // Check if the color is set

    const teamEL = document.getElementById(teamID);
    // console.log(teamEL); // Check if the element is found
    teamEL.style.fontSize = '20px';
    teamEL.textContent = pTeam;
    teamEL.style.color = 'rgb(66, 66, 66)'; // change color
    // console.log(teamEL.style.color); // Check if the color is set
	// console.log('log');
    resizeText(document.getElementById(wrapperID)); //resize if it overflows
}

//round change
function updateRound(round) {
	const roundEL = document.getElementById('round');
	roundEL.style.fontSize = roundSize; //set original text size
	roundEL.textContent = round; //change the actual text
	resizeText(roundEL); //resize it if it overflows
}

function updateTournament(tournamentName){
	const tournEL = document.getElementById('tournamentName');
	tournEL.style.fontSize = tournamentSize;
	tournEL.textContent = tournamentName;
	resizeText(tournEL);
}

//generic text changer
function updateText(textID, textToType, maxSize) {
	const textEL = document.getElementById(textID);
	textEL.style.fontSize = maxSize; //set original text size
	textEL.textContent = textToType; //change the actual text
	resizeText(textEL); //resize it if it overflows
}
// //social text changer
function updateSocialText(textID, textToType, maxSize, wrapper) {
	const textEL = document.getElementById(textID);
	textEL.style.fontSize = maxSize; //set original text size
	textEL.textContent = textToType; //change the actual text
	const wrapperEL = document.getElementById(wrapper)
	resizeText(wrapperEL); //resize it if it overflows
}


//fade out
function fadeOut(itemID, funct) {
	gsap.to(itemID, {opacity: 0, duration: fadeOutTime, onComplete: funct});
}

//fade out but with movement
function fadeOutMove(itemID, move, funct) {
	gsap.to(itemID, {x: -move, opacity: 0, ease: "power1.in", duration: fadeOutTime, onComplete: funct});
}

//fade out but for character/saga icon
function fadeOutPic (itemID, move, funct) {
	gsap.to(itemID, {x: -move, opacity: 0, ease: "power1.in", duration: fadeOutTime, onComplete: funct});
}

//fade in
function fadeIn(itemID) {
	gsap.to(itemID, {delay: .2, opacity: 1, duration: fadeInTime});
}

//fade in but with movement
function fadeInMove(itemID) {
	gsap.to(itemID, {delay: .3, x: 0, opacity: 1, ease: "power2.out", duration: fadeInTime});
}

function fadeInPic(itemID, move = 0) {
	gsap.to(itemID, {delay: .2, x: 0, opacity: 1, ease: "power2.out", duration: fadeInTime});
}

// //fade in for the characters when first loading
function initPicFade(picID, move = 0) {
	gsap.fromTo(picID,
		{x: 0},
		{delay: introDelay, x: 0, opacity: 1, ease: "power2.out", duration: fadeInTime});
}

//played when loading the html
function moveScoresIntro(pNum, bestOf, pWL, move) {
	const score1EL = document.getElementById('win1P'+pNum);
	const score2EL = document.getElementById('win2P'+pNum);
	const score3EL = document.getElementById('win3P'+pNum);
	const wlEL = document.getElementById('wlP'+pNum);

	gsap.fromTo(score1EL, 
		{x:-move},
		{delay: introDelay+.2, x: 0, opacity: 1, ease: "power2.out", duration: fadeInTime});
	if (bestOf == "Bo3"){
        gsap.fromTo(score2EL, 
		{x:-move},
		{delay: introDelay+.4, x: 0, opacity: 1, ease: "power2.out", duration: fadeInTime});
    }
	if (bestOf == "Bo5") {
		gsap.fromTo(score2EL, 
        {x:-move},
        {delay: introDelay+.4, x: 0, opacity: 1, ease: "power2.out", duration: fadeInTime});
        gsap.fromTo(score3EL, 
        {x:-move},
        {delay: introDelay+.6, x: 0, opacity: 1, ease: "power2.out", duration: fadeInTime});
	}
	if (pWL == "W" || pWL == "L") {
		gsap.fromTo(wlEL, 
			{x:-move},
			{delay: introDelay+.8, x: 0, opacity: 1, ease: "power2.out", duration: fadeInTime});
	}

}

// function moveTimerIntro(){
// 	if(timerToggle){
// 		gsap.to("#overlayTimer", {delay: .3, y: 0, opacity: 1, ease: "power2.out", duration: fadeInTime});
// 	}
// }

//check if winning or losing in a GF, then change image
function updateWL(pWL, playerNum) {
	const pWLEL = document.getElementById('wlP' + playerNum + 'Text');
	if (pWL == "W") {
		pWLEL.setAttribute('src', 'Resources/Overlay/[W].png')
	} else if (pWL == "L") {
		pWLEL.setAttribute('src', 'Resources/Overlay/[L].png')
	}
	if (startup) {pWLEL.addEventListener("error", () => {
		showNothing(pWLEL)
	})}
}

//text resize, keeps making the text smaller until it fits
function resizeText(textEL) {
	const childrens = textEL.children;
	while (textEL.scrollWidth > textEL.offsetWidth) {
		if (childrens.length > 0) { //for team+player texts
			Array.from(childrens).forEach(function (child) {
				child.style.fontSize = getFontSize(child);
			});
		} else {
			textEL.style.fontSize = getFontSize(textEL);
		}
	}
}
//returns a smaller fontSize for the given element
function getFontSize(textElement) {
	return (parseFloat(textElement.style.fontSize.slice(0, -2)) * .90) + 'px';
}

//searches for the main json file
function getInfo() {
	return new Promise(function (resolve) {
		const oReq = new XMLHttpRequest();
		oReq.addEventListener("load", reqListener);
		oReq.open("GET", 'Resources/Texts/ScoreboardInfo.json');
		oReq.send();

		//will trigger when file loads
		function reqListener () {
			resolve(JSON.parse(oReq.responseText))
		}
	})
}

function getStageInfo() {
	return new Promise(function (resolve) {
		const oReq = new XMLHttpRequest();
		oReq.addEventListener("load", reqListener);
		oReq.open("GET", 'Resources/Texts/StageStrikingInfo.json');
		oReq.send();

		//will trigger when file loads
		function reqListener () {
			resolve(JSON.parse(oReq.responseText))
		}
	})
}

async function updatePlayerPic(picID, n) {
    const charEL = document.getElementById(picID);
    let src = 'Resources/Player Icons/p' + n + '.png';
    
    // Log the values of p1Pic and p2Pic
    // console.log('p1Pic:', p1Pic);
    // console.log('p2Pic:', p2Pic);

    // Check if p1Pic or p2Pic are null or empty strings and set to black.png if true
    if (p1Pic === "") {
        src = 'Resources/Player Icons/black.png';
    } else if (p2Pic === "") {
        src = 'Resources/Player Icons/black.png';
    } else {
        const timestamp = new Date().getTime();
        src += '?' + timestamp;
    }

    charEL.setAttribute('src', src);
}

// read timer files
async function readTimerFiles() {
	try {
		const startTimeResponse = await fetch(timerFolder + '/Start Time.txt');
		const elapsedTimeResponse = await fetch (timerFolder + '/Elapsed Time.txt');
		
		if (!startTimeResponse.ok || !elapsedTimeResponse.ok){
			throw new Error("Failed to fetch one or more files");
		}

		const startTimeFromFile = await startTimeResponse.text();
		const elapsedTimeFromFile = await elapsedTimeResponse.text();

		startTime = parseInt(startTimeFromFile);
		elapsedTime = parseInt(elapsedTimeFromFile);
		if(!countedDown && elapsedTime > 0){
			if (!isRunning){
				remainingTime = elapsedTime;
				countdownTimer = setInterval(function() {
					if (remainingTime > 0) {
						let seconds = remainingTime % 60;
						document.getElementById('timer').textContent = `${seconds}`;
						remainingTime--;
					} else {
						clearInterval(countdownTimer); // Stop the countdown
						document.getElementById('timer').textContent = "GO!";  // Display "GO!"
						//setTimeout(startTimer, 0);  // Wait 1 second, then start the main timer
					}
				}, 1000);
			}
			countedDown = true;
		} else {
			if(!isRunning && elapsedTime === 0){
				if(startTime != 0){
					startTimer();
				}
				if (startTime === 0 && elapsedTime === 0) {
					resetTimer();
				}
			} else if (isRunning) {
				if (elapsedTime > 10){
					stopTimer()
				}
				if (startTime === 0) {
					resetTimer();
				}
			}
		}
	} catch (error){
		console.error("error reading file(s)")
	}
}

// Start timer
function startTimer() {
	console.log('start called');
    if (!isRunning) {
        isRunning = true;
        timer = setInterval(updateTimer, 1000); // Update the timer every second
    }
}

// Update timer every second
function updateTimer() {
    const currentTime = Date.now();
    elapsedTime = currentTime - startTime;
    
    let hours = Math.floor(elapsedTime / (1000 * 60 * 60));
    let minutes = Math.floor(elapsedTime / (1000 * 60) % 60);
    let seconds = Math.floor(elapsedTime / 1000 % 60);

    if(Math.floor(elapsedTime/1000) < 60){
        document.getElementById('timer').textContent=`${seconds}`;
    } else if (Math.floor(elapsedTime/(60*1000) < 60)) {
        seconds = String(seconds).padStart(2, "0");
        document.getElementById('timer').textContent=`${minutes}:${seconds}`;
    } else {
        seconds = String(seconds).padStart(2, "0");
		minutes = String(minutes).padStart(2, "0");
        document.getElementById('timer').textContent = `${hours}:${minutes}:${seconds}`;
    }
}

// stop timer
function stopTimer() {
	console.log('stop called');
    if (isRunning) {
        clearInterval(timer);
        isRunning = false;
    }
}

// reset timer
function resetTimer(){
	// console.log('reset called');
	clearInterval(timer);
	isRunning = false;
	countedDown = false;
	document.getElementById('timer').textContent = '0';
}