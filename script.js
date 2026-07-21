// ========================================
// USER DATA
// ========================================

let userData = {
    unlockedRewards: [],
    name: "Alex",
    birthdate: null,

    ageVerified: false,
    privacyConsent: false,
    onboardingComplete: false,

    // Membership
    plan: "free",
    vapeCapConnected: false,

    // Today's usage
    sessions: 0,
    puffs: 0,

    // Goals & Baseline
    baselineSessionsPerDay: 10,
    baselinePuffsPerSession: 8,
    baselinePuffsPerDay: 80,

    // Automatically generated starting targets
    sessionLimit: 9,
    puffLimit: 72,

    streak: 0,

    goalType: "reduce",

    // Initial Breezy reduction plan starts at 10%
    reductionGoal: 10,

    // Challenge progression
    challengeStage: 3,
    challengeDay: 0,
    completedChallengeStages: 0,
    completed21DayCycles: 0,
    currentReductionPercent: 10,
    challengeStartDate: null,
    lastChallengeEvaluationDate: null,

    // Streak & Recovery Day
    recoveryDayActive: false,
    recoveryTriggeredDate: null,
    lastSuccessfulChallengeDate: null,

    // Reward anti-farming ledger
    rewardLedger: {
        dailyLoggingDates: [],
        peerEncouragementDates: [],
        celebratedAchievements: [],
        challengeMilestones: [],
        healthyHabits: [],
        journalDates: [],
        educationResources: []
    },

    // Rewards
    points: 0,
    totalXP: 0,

    // Preferences
    peerNotifications: true,
    cravingSupport: true,

    // Actual tracking history
    sessionHistory: [],

    // Healthy Habits & Cessation Journal
    healthyHabitCompletions: {},
    journalEntries: [],

    // Learn / Education
    educationReflections: {},

    // Notifications
    notifications: [],

    // Developer demo mode
    demoMode: false,
    demoBackup: null,
    demoGeneratedAt: null

};

// ========================================
// LOCAL STORAGE
// ========================================

const STORAGE_KEY =
    "breezyUserData";

// Backward compatibility for builds that used the old BreatheFree key.
const LEGACY_STORAGE_KEY =
    "breatheFreeUserData";


function saveData() {

    localStorage.setItem(

        STORAGE_KEY,

        JSON.stringify(
            userData
        )

    );

}


function loadData() {

    const savedData =

        localStorage.getItem(
            STORAGE_KEY
        ) ||
        localStorage.getItem(
            LEGACY_STORAGE_KEY
        );


    if (savedData) {

        const parsedData =

            JSON.parse(
                savedData
            );


        userData = {

            ...userData,

            ...parsedData

        };

    }

}


loadData();

// ========================================
// WELLNESS DATA MIGRATION
// ========================================
if (!userData.healthyHabitCompletions || typeof userData.healthyHabitCompletions !== "object") userData.healthyHabitCompletions = {};
if (!Array.isArray(userData.journalEntries)) userData.journalEntries = [];
if (!userData.rewardLedger || typeof userData.rewardLedger !== "object") userData.rewardLedger = {};
if (!Array.isArray(userData.rewardLedger.healthyHabits)) userData.rewardLedger.healthyHabits = [];
if (!Array.isArray(userData.rewardLedger.journalDates)) userData.rewardLedger.journalDates = [];
if (!Array.isArray(userData.rewardLedger.educationResources)) userData.rewardLedger.educationResources = [];
if (!userData.educationReflections || typeof userData.educationReflections !== "object") userData.educationReflections = {};

// ========================================
// BASELINE DATA MIGRATION
// ========================================

// Older Breezy saves did not contain
// baseline vaping information.

if (
    !userData.baselineSessionsPerDay
) {

    userData.baselineSessionsPerDay =
        userData.sessionLimit || 10;

}


if (
    !userData.baselinePuffsPerDay
) {

    userData.baselinePuffsPerDay =
        userData.puffLimit || 80;

}


if (
    !userData.baselinePuffsPerSession
) {

    userData.baselinePuffsPerSession =

        Math.max(
            1,
            Math.round(
                userData.baselinePuffsPerDay /
                userData.baselineSessionsPerDay
            )
        );

}

// ========================================
// CHALLENGE DATA MIGRATION
// ========================================

if (![3, 7, 14, 21].includes(Number(userData.challengeStage))) {
    userData.challengeStage = 3;
}
if (typeof userData.challengeDay !== "number") userData.challengeDay = 0;
if (typeof userData.completedChallengeStages !== "number") userData.completedChallengeStages = 0;
if (typeof userData.completed21DayCycles !== "number") userData.completed21DayCycles = 0;
if (typeof userData.currentReductionPercent !== "number") userData.currentReductionPercent = 10;
if (userData.challengeStartDate === undefined) userData.challengeStartDate = null;
if (userData.lastChallengeEvaluationDate === undefined) userData.lastChallengeEvaluationDate = null;
if (userData.recoveryDayActive === undefined) userData.recoveryDayActive = false;
if (userData.recoveryTriggeredDate === undefined) userData.recoveryTriggeredDate = null;
if (userData.lastSuccessfulChallengeDate === undefined) userData.lastSuccessfulChallengeDate = null;
if (!userData.rewardLedger || typeof userData.rewardLedger !== "object") userData.rewardLedger = {};
if (!Array.isArray(userData.rewardLedger.dailyLoggingDates)) userData.rewardLedger.dailyLoggingDates = [];
if (!Array.isArray(userData.rewardLedger.peerEncouragementDates)) userData.rewardLedger.peerEncouragementDates = [];
if (!Array.isArray(userData.rewardLedger.celebratedAchievements)) userData.rewardLedger.celebratedAchievements = [];
if (!Array.isArray(userData.rewardLedger.challengeMilestones)) userData.rewardLedger.challengeMilestones = [];

const CHALLENGE_STAGES = [3, 7, 14, 21];

function getChallengeReductionPercent() {
    const goal = Math.max(5, Number(userData.reductionGoal) || 25);
    const stage = Number(userData.challengeStage) || 3;

    if (stage === 3) return Math.min(10, goal);
    if (stage === 7) return Math.min(15, goal);
    if (stage === 14) return Math.min(20, goal);
    return goal;
}

function updateChallengeTarget() {
    const baseline = Math.max(1, Number(userData.baselinePuffsPerDay) || 80);
    const reduction = getChallengeReductionPercent();
    userData.currentReductionPercent = reduction;
    userData.puffLimit = Math.max(1, Math.round(baseline * (1 - reduction / 100)));

    const baselineSessions = Math.max(1, Number(userData.baselineSessionsPerDay) || 10);
    userData.sessionLimit = Math.max(1, Math.round(baselineSessions * (1 - reduction / 100)));
}

function advanceChallengeStage() {
    const currentStage = Number(userData.challengeStage) || 3;
    userData.completedChallengeStages = (userData.completedChallengeStages || 0) + 1;

    if (currentStage === 3) userData.challengeStage = 7;
    else if (currentStage === 7) userData.challengeStage = 14;
    else if (currentStage === 14) userData.challengeStage = 21;
    else {
        userData.challengeStage = 21;
        userData.completed21DayCycles = (userData.completed21DayCycles || 0) + 1;
    }

    userData.challengeDay = 0;
    userData.challengeStartDate = new Date().toISOString();
    updateChallengeTarget();
    saveData();
    updateChallengeUI();
}

function getChallengeMilestoneReward(stage) {
    return ({ 3: 60, 7: 125, 14: 300, 21: 600 })[stage] || 0;
}

function recordSuccessfulChallengeDay(dateKey) {
    const stageLength = Number(userData.challengeStage) || 3;
    userData.challengeDay = (userData.challengeDay || 0) + 1;
    userData.lastSuccessfulChallengeDate = dateKey || getLocalDateKey(new Date());

    if (userData.challengeDay >= stageLength) {
        const cycleNumber = stageLength === 21 ? (userData.completed21DayCycles || 0) + 1 : 0;
        const milestoneKey = stageLength + "-day-" + (cycleNumber || (userData.completedChallengeStages || 0) + 1);
        if (!userData.rewardLedger.challengeMilestones.includes(milestoneKey)) {
            const reward = getChallengeMilestoneReward(stageLength);
            if (reward) awardPoints(reward);
            userData.rewardLedger.challengeMilestones.push(milestoneKey);
        }
        advanceChallengeStage();
    } else {
        saveData();
    }
    updateChallengeUI();
}

function updateChallengeUI() {
    const stage = Number(userData.challengeStage) || 3;
    const day = Math.min(Number(userData.challengeDay) || 0, stage);
    const reduction = getChallengeReductionPercent();
    const percentage = Math.min(100, Math.round((day / stage) * 100));

    const values = {
        challengeStageTitle: stage + "-Day Challenge",
        challengeReductionBadge: reduction + "% reduction",
        challengeDayLabel: "Day " + day + " of " + stage,
        challengePercentLabel: percentage + "%",
        challengeBaseline: userData.baselinePuffsPerDay,
        challengeDailyTarget: userData.puffLimit
    };

    Object.entries(values).forEach(([id, value]) => {
        const element = document.getElementById(id);
        if (element) element.textContent = value;
    });

    const progressFill = document.getElementById("challengeProgressFill");
    if (progressFill) progressFill.style.width = percentage + "%";
}

// ========================================
// DAILY STREAK & RECOVERY ENGINE
// ========================================

function getLocalDateKey(date) {
    const d = new Date(date);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return y + "-" + m + "-" + day;
}

function getPuffsForDate(dateKey) {
    return (userData.sessionHistory || [])
        .filter(session => getLocalDateKey(session.timestamp) === dateKey)
        .reduce((sum, session) => sum + Number(session.puffs || 0), 0);
}

function evaluateCompletedDay(dateKey) {
    if (!dateKey || userData.lastChallengeEvaluationDate === dateKey) return;

    const puffs = getPuffsForDate(dateKey);
    const target = Math.max(1, Number(userData.puffLimit) || 1);

    // A day with no logged usage is not automatically treated as a successful
    // challenge day; Breezy needs a completed daily log to evaluate it.
    const wasLogged = userData.rewardLedger.dailyLoggingDates.includes(dateKey) || puffs > 0;
    if (!wasLogged) {
        userData.lastChallengeEvaluationDate = dateKey;
        saveData();
        return;
    }

    if (userData.recoveryDayActive) {
        if (puffs <= target) {
            // Successful Recovery Day preserves the existing streak.
            userData.recoveryDayActive = false;
            userData.recoveryTriggeredDate = null;
            recordSuccessfulChallengeDay(dateKey);
        } else {
            // Two consecutive above-target days reset the streak and challenge.
            userData.streak = 0;
            userData.recoveryDayActive = false;
            userData.recoveryTriggeredDate = null;
            userData.challengeDay = 0;
        }
    } else if (puffs < target) {
        userData.streak = (userData.streak || 0) + 1;
        recordSuccessfulChallengeDay(dateKey);
    } else if (puffs === target) {
        // Exactly at target maintains the streak but still counts as a
        // successfully completed challenge day.
        recordSuccessfulChallengeDay(dateKey);
    } else {
        // First above-target day creates one Recovery Day opportunity.
        userData.recoveryDayActive = true;
        userData.recoveryTriggeredDate = dateKey;
    }

    userData.lastChallengeEvaluationDate = dateKey;
    saveData();
}

function evaluatePendingChallengeDay() {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    evaluateCompletedDay(getLocalDateKey(yesterday));
}

function updateRecoveryDayUI() {
    const card = document.getElementById("recoveryDayCard");
    const status = document.getElementById("recoveryDayStatus");
    if (!card || !status) return;

    if (userData.recoveryDayActive) {
        card.classList.remove("hidden");
        status.textContent = "Stay at or below " + userData.puffLimit + " puffs today to preserve your " + (userData.streak || 0) + "-day streak.";
    } else {
        card.classList.add("hidden");
    }
}

function awardOncePerDay(ledgerName, amount, dateKey) {
    const key = dateKey || getLocalDateKey(new Date());
    const ledger = userData.rewardLedger[ledgerName];
    if (!Array.isArray(ledger) || ledger.includes(key)) return 0;
    ledger.push(key);
    return awardPoints(amount);
}

// ========================================
// POINT & XP SYSTEM
// ========================================

function awardPoints(
    amount
) {

    // PRO users receive 2x BreezyPoints

    const multiplier =

        userData.plan === "pro"
        ? 2
        : 1;


    const earnedPoints =

        amount *
        multiplier;


    userData.points +=
        earnedPoints;


    // XP remains the same for everyone

    userData.totalXP +=
        amount;


    saveData();


    return earnedPoints;

}

// ========================================
// HOME ELEMENTS
// ========================================

const logButton =
    document.getElementById("logButton");

const logModal =
    document.getElementById("logModal");

const closeModal =
    document.getElementById("closeModal");

const sessionCount =
    document.getElementById("sessionCount");

const puffCount =
    document.getElementById("puffCount");

const sessionProgress =
    document.getElementById("sessionProgress");

const sessionPercentage =
    document.getElementById("sessionPercentage");

const usageStatus =
    document.getElementById("usageStatus");


// ========================================
// LOG SESSION ELEMENTS
// ========================================

const puffInput =
    document.getElementById("puffInput");

const increasePuff =
    document.getElementById("increasePuff");

const decreasePuff =
    document.getElementById("decreasePuff");

const cravingInput =
    document.getElementById("cravingInput");

const cravingValue =
    document.getElementById("cravingValue");

const triggerInput =
    document.getElementById("triggerInput");

const customTriggerWrap =
    document.getElementById("customTriggerWrap");

const customTriggerInput =
    document.getElementById("customTriggerInput");

const submitSession =
    document.getElementById("submitSession");


let selectedPuffs = 5;
let selectedCravingLevel = 3;


function updateCustomTriggerVisibility() {

    if (!customTriggerWrap) {
        return;
    }

    const showCustomTrigger =
        triggerInput.value === "Other";

    customTriggerWrap.classList.toggle(
        "hidden",
        !showCustomTrigger
    );

    if (
        !showCustomTrigger &&
        customTriggerInput
    ) {
        customTriggerInput.value = "";
    }

}


function resetLogSessionForm() {

    selectedPuffs = 5;
    selectedCravingLevel = 3;

    puffInput.textContent = "5";
    cravingInput.value = "3";
    cravingValue.textContent = "3";
    triggerInput.value = "Stress";

    if (customTriggerInput) {
        customTriggerInput.value = "";
    }

    updateCustomTriggerVisibility();

}


// ========================================
// LOG MODAL
// ========================================

logButton.addEventListener(

    "click",

    function() {

        if (logModal) {
            logModal.classList.remove("hidden");
        }

    }

);


closeModal.addEventListener(

    "click",

    function() {

        logModal.classList.add("hidden");

    }

);


// ========================================
// PUFF COUNTER
// ========================================

increasePuff.addEventListener(

    "click",

    function() {

        selectedPuffs++;

        puffInput.textContent =
            selectedPuffs;

    }

);


decreasePuff.addEventListener(

    "click",

    function() {

        if (selectedPuffs > 1) {

            selectedPuffs--;

            puffInput.textContent =
                selectedPuffs;

        }

    }

);


// ========================================
// CRAVING
// ========================================

cravingInput.addEventListener(

    "input",

    function() {

        selectedCravingLevel =
            Number(cravingInput.value);

        cravingValue.textContent =
            selectedCravingLevel;

    }

);


// ========================================
// TRIGGER
// ========================================

triggerInput.addEventListener(
    "change",
    updateCustomTriggerVisibility
);

updateCustomTriggerVisibility();


// ========================================
// LOG SESSION
// ========================================

submitSession.addEventListener(

    "click",

    function() {

        const triggerCategory =
            triggerInput.value;

        const customTrigger =
            customTriggerInput
                ? customTriggerInput.value.trim()
                : "";

        const resolvedTrigger =
            triggerCategory === "Other"
                ? customTrigger
                : triggerCategory;

        if (
            triggerCategory === "Other" &&
            !resolvedTrigger
        ) {

            alert(
                "Please describe your custom trigger before logging this session."
            );

            return;

        }

        userData.sessions++;

        userData.puffs +=
            selectedPuffs;

        const normalizedCraving = Math.max(
            1,
            Math.min(
                10,
                selectedCravingLevel * 2
            )
        );

        // Save actual session record

        const sessionRecord = {

            id:
                Date.now(),

            timestamp:
                new Date().toISOString(),

            puffs:
                selectedPuffs,

            cravingLevel:
                selectedCravingLevel,

            craving:
                normalizedCraving,

            trigger:
                resolvedTrigger,

            triggerCategory:
                triggerCategory,

            triggerDetail:
                customTrigger || ""

        };


        userData.sessionHistory.push(
            sessionRecord
        );

        setTimeout(
            () => showRiskPrediction(
                userData.sessionHistory[
                    userData.sessionHistory.length - 1
                ]
            ),
            150
        );


        saveData();

        const todayKey = getLocalDateKey(new Date());
        const earnedPoints = awardOncePerDay(
            "dailyLoggingDates",
            15,
            todayKey
        );


        updateDashboard();
        renderAICoach();


        logModal.classList.add(
            "hidden"
        );


        alert(

            "Session logged!\n\n" +

            "Trigger: " +
            resolvedTrigger +

            "\nCraving level: " +
            selectedCravingLevel +
            "/5" +

            "\nPuffs: " +
            selectedPuffs +

            (earnedPoints > 0
                ? "\n\n+" + earnedPoints + " BreezyPoints for completing today\'s logging!"
                : "\n\nToday\'s logging reward has already been earned.")

        );


        resetLogSessionForm();

    }

);
// ========================================
// REAL USAGE CALCULATIONS
// ========================================

function isSameDay(
    dateA,
    dateB
) {

    return (

        dateA.getFullYear() ===
        dateB.getFullYear()

        &&

        dateA.getMonth() ===
        dateB.getMonth()

        &&

        dateA.getDate() ===
        dateB.getDate()

    );

}


function calculateTodayUsage() {

    const today =
        new Date();


    const todaySessions =

        userData.sessionHistory.filter(

            function(session) {

                return isSameDay(

                    new Date(
                        session.timestamp
                    ),

                    today

                );

            }

        );


    userData.sessions =
        todaySessions.length;


    userData.puffs =

        todaySessions.reduce(

            function(
                total,
                session
            ) {

                return total +
                    session.puffs;

            },

            0

        );

}
// ========================================
// REPORT SYSTEM
// ========================================

function getSessionsFromDays(
    numberOfDays
) {

    const cutoff =
        new Date();


    cutoff.setDate(

        cutoff.getDate() -
        numberOfDays

    );


    return userData.sessionHistory.filter(

        function(session) {

            return (

                new Date(
                    session.timestamp
                ) >= cutoff

            );

        }

    );

}


function calculateReport(
    numberOfDays
) {

    const sessions =

        getSessionsFromDays(
            numberOfDays
        );


    const totalSessions =
        sessions.length;


    const totalPuffs =

        sessions.reduce(

            function(
                total,
                session
            ) {

                return total +
                    session.puffs;

            },

            0

        );


    const averageCraving =

        sessions.length > 0

        ?

        sessions.reduce(

            function(
                total,
                session
            ) {

                return total +
                    session.craving;

            },

            0

        ) /

        sessions.length

        :

        0;


    return {

        totalSessions:
            totalSessions,

        totalPuffs:
            totalPuffs,

        averageSessions:

            totalSessions /
            numberOfDays,

        averagePuffs:

            totalPuffs /
            numberOfDays,

        averageCraving:

            averageCraving

    };

}

function calculateTriggers(
    numberOfDays
) {

    const sessions =

        getSessionsFromDays(
            numberOfDays
        );


    const triggers = {};


    sessions.forEach(

        function(session) {

            if (
                !triggers[
                    session.trigger
                ]
            ) {

                triggers[
                    session.trigger
                ] = 0;

            }


            triggers[
                session.trigger
            ]++;

        }

    );


    return Object.entries(
        triggers
    ).sort(

        function(a, b) {

            return b[1] - a[1];

        }

    );

}

// ========================================
// UPDATE DASHBOARD
// ========================================

function updateDashboard() {

    calculateTodayUsage();

    const streakElement =
        document.getElementById("streak");

    if (streakElement) {
        streakElement.textContent =
            userData.streak || 0;
    }

    sessionCount.textContent =
        userData.sessions;


    puffCount.textContent =
        userData.puffs;


    // Puffs are Breezy's primary reduction metric.
    let percentage = (userData.puffs / Math.max(1, userData.puffLimit)) * 100;
    let visualPercentage = Math.min(percentage, 100);

    sessionProgress.style.width = visualPercentage + "%";
    sessionPercentage.textContent = Math.round(percentage) + "%";

    if (userData.puffs < userData.puffLimit) {
        usageStatus.textContent = "On Track";
        usageStatus.style.background = "#d1fae5";
        usageStatus.style.color = "#047857";
    } else if (userData.puffs === userData.puffLimit) {
        usageStatus.textContent = "Target Reached";
        usageStatus.style.background = "#fef3c7";
        usageStatus.style.color = "#92400e";
    } else {
        usageStatus.textContent = "Above Target";
        usageStatus.style.background = "#fee2e2";
        usageStatus.style.color = "#b91c1c";
    }

    renderAICoach();


    if (typeof updateAICoach === "function") {
        updateAICoach();
    }

    if (typeof renderRecoveryScore === "function") {
        renderRecoveryScore();
    }
    if (typeof bindCoachButtons === "function") bindCoachButtons();
    if (typeof updateRiskMonitorCard === "function") updateRiskMonitorCard();
    if (typeof bindRiskMonitorButtons === "function") bindRiskMonitorButtons();
    if (typeof renderSmartGoal === "function") renderSmartGoal();
    if (typeof updateAchievements === "function") updateAchievements();
    if (typeof updateChallengeUI === "function") updateChallengeUI();
    if (typeof updateRecoveryDayUI === "function") updateRecoveryDayUI();
}



// ========================================
// ANALYTICS ENGINE
// ========================================

function getSessionsForLastDays(days) {

    const endDate =
        new Date();

    const startDate =
        new Date(endDate);

    startDate.setDate(
        startDate.getDate() - (days - 1)
    );
    startDate.setHours(
        0, 0, 0, 0
    );

    return userData.sessionHistory.filter(
        session => {

            const sessionDate =
                new Date(
                    session.timestamp
                );

            return (
                sessionDate >= startDate &&
                sessionDate <= endDate
            );

        }
    );

}


function averageOf(values) {

    if (
        !values ||
        !values.length
    ) {
        return 0;
    }

    return values.reduce(
        (sum, value) => sum + value,
        0
    ) / values.length;

}


function getTriggerStats(sessions) {

    const counts = {};

    sessions.forEach(
        session => {

            const trigger =
                session.trigger || "Unknown";

            counts[trigger] =
                (counts[trigger] || 0) + 1;

        }
    );

    return Object.entries(counts)
        .map(
            ([trigger, count]) => ({
                trigger,
                count,
                percentage: sessions.length
                    ? Math.round(
                        (count / sessions.length) * 100
                    )
                    : 0
            })
        )
        .sort(
            (a, b) => b.count - a.count
        );

}


function getHourlyStats(sessions) {

    const counts = Array(24).fill(0);

    sessions.forEach(
        session => {
            const hour =
                new Date(
                    session.timestamp
                ).getHours();
            counts[hour]++;
        }
    );

    return counts;

}


function getDayStats(sessions) {

    const labels = [
        "Sunday",
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday"
    ];

    const counts = Array(7).fill(0);

    sessions.forEach(
        session => {
            counts[
                new Date(
                    session.timestamp
                ).getDay()
            ]++;
        }
    );

    return labels.map(
        (label, index) => ({
            label,
            count: counts[index]
        })
    );

}


function calculateCurrentStreak() {

    const seenDays =
        new Set(
            userData.sessionHistory.map(
                session =>
                    new Date(
                        session.timestamp
                    ).toDateString()
            )
        );

    let streak = 0;
    const cursor = new Date();
    cursor.setHours(0, 0, 0, 0);

    while (
        seenDays.has(
            cursor.toDateString()
        )
    ) {
        streak++;
        cursor.setDate(
            cursor.getDate() - 1
        );
    }

    return streak;

}


function analyzeUsage(days = 30) {

    const sessions =
        getSessionsForLastDays(days);

    const dailyCounts = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (
        let offset = days - 1;
        offset >= 0;
        offset--
    ) {
        const day = new Date(today);
        day.setDate(day.getDate() - offset);
        const label = day.toDateString();
        dailyCounts.push(
            sessions.filter(
                session =>
                    new Date(
                        session.timestamp
                    ).toDateString() === label
            ).length
        );
    }

    const totalSessions = sessions.length;
    const totalPuffs = sessions.reduce(
        (sum, session) =>
            sum + Number(session.puffs || 0),
        0
    );
    const averageCraving = averageOf(
        sessions.map(
            session =>
                Number(session.craving || 0)
        )
    );
    const triggerStats = getTriggerStats(sessions);
    const hourlyStats = getHourlyStats(sessions);
    const dayStats = getDayStats(sessions);
    const peakHour = hourlyStats.indexOf(
        Math.max(...hourlyStats)
    );
    const peakDay = dayStats.slice().sort(
        (a, b) => b.count - a.count
    )[0] || { label: "None", count: 0 };

    const midpoint = Math.ceil(dailyCounts.length / 2);
    const firstAverage = averageOf(dailyCounts.slice(0, midpoint));
    const secondAverage = averageOf(dailyCounts.slice(midpoint));

    const reductionPercent =
        firstAverage > 0
            ? Math.max(
                0,
                Math.round(
                    ((firstAverage - secondAverage) / firstAverage) * 100
                )
            )
            : 0;

    const weekdaySessions = sessions.filter(
        session => {
            const day = new Date(session.timestamp).getDay();
            return day >= 1 && day <= 5;
        }
    ).length;

    const weekendSessions = sessions.length - weekdaySessions;
    const eveningSessions = sessions.filter(
        session => {
            const hour = new Date(session.timestamp).getHours();
            return hour >= 18 && hour <= 23;
        }
    ).length;
    const highCravingSessions = sessions.filter(
        session => Number(session.craving || 0) >= 8
    ).length;

    return {
        days,
        sessions,
        totalSessions,
        totalPuffs,
        averageSessionsPerDay: Number((totalSessions / days).toFixed(1)),
        averagePuffsPerSession: Number(
            (totalSessions ? totalPuffs / totalSessions : 0).toFixed(1)
        ),
        averageCraving: Number(averageCraving.toFixed(1)),
        currentStreak: calculateCurrentStreak(),
        triggerStats,
        topTrigger: triggerStats[0] || {
            trigger: "None",
            count: 0,
            percentage: 0
        },
        hourlyStats,
        dayStats,
        peakHour,
        peakDay,
        dailyCounts,
        weekdaySessions,
        weekendSessions,
        eveningPercentage: sessions.length
            ? Math.round((eveningSessions / sessions.length) * 100)
            : 0,
        highCravingPercentage: sessions.length
            ? Math.round((highCravingSessions / sessions.length) * 100)
            : 0,
        goalAdherence: days
            ? Math.round(
                dailyCounts.filter(
                    count => count <= userData.sessionLimit
                ).length / days * 100
            )
            : 0,
        reductionPercent
    };

}


function buildAICoachInsight() {

    const analytics14 = analyzeUsage(14);
    const analytics7 = analyzeUsage(7);

    let headline = "Keep going—you’ve got this.";
    let body = "Your Coach will highlight the strongest pattern in your recent logs.";
    let action = "Open Progress for more detail";
    let tone = "Coach";
    let priority = "Moderate";
    let actionMode = "progress";

    if (analytics14.totalSessions === 0) {
        headline = "Start with one honest log.";
        body = "Once you log sessions, Coach can spot your main triggers, timing patterns, and progress trends.";
        action = "Log one session to begin";
        tone = "Getting started";
        priority = "Low";
        actionMode = "progress";
    }

    else if (
        analytics14.topTrigger.trigger === "Stress" ||
        analytics14.topTrigger.trigger === "Academic Pressure"
    ) {
        headline = `${analytics14.topTrigger.trigger} is leading your recent sessions.`;
        body = `In the last 14 days, ${analytics14.topTrigger.trigger.toLowerCase()} accounted for ${analytics14.topTrigger.percentage}% of your sessions. Try opening SOS or a breathing exercise before the evening rush.`;
        action = "Turn on evening SOS reminders";
        tone = "Trigger pattern";
        priority = analytics14.topTrigger.percentage >= 45 ? "High" : "Medium";
        actionMode = analytics14.topTrigger.percentage >= 45 ? "sos" : "progress";
    }

    else if (analytics14.eveningPercentage >= 45) {
        headline = "Most of your sessions happen in the evening.";
        body = `About ${analytics14.eveningPercentage}% of your recent sessions happened after 6 PM. That usually means your highest-risk window is after classes and before bed.`;
        action = "Open Breathe before leaving campus";
        tone = "Timing pattern";
        priority = analytics14.eveningPercentage >= 60 ? "High" : "Medium";
        actionMode = analytics14.eveningPercentage >= 60 ? "sos" : "progress";
    }

    else if (
        analytics14.peakHour >= 16 &&
        analytics14.peakHour <= 20 &&
        analytics14.weekdaySessions > analytics14.weekendSessions
    ) {
        headline = "Your pattern looks school-day driven.";
        body = `Your busiest hour is around ${analytics14.peakHour}:00, which suggests vaping often happens after class or during your late-afternoon break.`;
        action = "Use a 5-minute delay after class";
        tone = "School day pattern";
        priority = "Medium";
        actionMode = "progress";
    }

    else if (analytics14.highCravingPercentage >= 25) {
        headline = "High cravings are showing up often.";
        body = `Roughly ${analytics14.highCravingPercentage}% of sessions had cravings at 8 or higher. A short delay or breathing exercise may help interrupt the urge.`;
        action = "Try a breathing break first";
        tone = "Craving pattern";
        priority = "High";
        actionMode = "sos";
    }

    else if (analytics14.reductionPercent >= 15) {
        headline = "You’re trending down nicely.";
        body = `Compared with earlier in the same period, your sessions are down by ${analytics14.reductionPercent}%. That is a strong sign your plan is working.`;
        action = "Keep your current goal";
        tone = "Progress pattern";
        priority = "Positive";
        actionMode = "progress";
    }

    else if (
        analytics7.averageSessionsPerDay <
        analytics14.averageSessionsPerDay
    ) {
        headline = "This week is lighter than your recent average.";
        body = `Your current 7-day pace is ${analytics7.averageSessionsPerDay} sessions/day, below the recent 14-day average of ${analytics14.averageSessionsPerDay}.`;
        action = "Lock in the momentum";
        tone = "Momentum";
        priority = "Positive";
        actionMode = "progress";
    }

    else {
        headline = "Your routine is becoming more predictable.";
        body = `Coach sees your strongest pattern around ${analytics14.peakHour}:00 on ${analytics14.peakDay.label.toLowerCase()}. That makes it easier to plan support ahead of time.`;
        action = "Prep support for your risk window";
        tone = "Pattern detected";
        priority = "Moderate";
        actionMode = "progress";
    }

    return {
        headline,
        body,
        action,
        tone,
        priority,
        actionMode,
        analytics14,
        analytics7
    };

}


function renderAICoach() {

    const insight = buildAICoachInsight();

    const homeHeadline = document.getElementById("homeCoachHeadline");
    const homeBody = document.getElementById("homeCoachBody");
    const homeAction = document.getElementById("homeCoachAction");

    const progressLabel = document.getElementById("progressCoachLabel");
    const progressHeadline = document.getElementById("progressCoachHeadline");
    const progressBody = document.getElementById("progressCoachBody");
    const progressAction = document.getElementById("progressCoachAction");

    if (homeHeadline) homeHeadline.textContent = insight.headline;
    if (homeBody) homeBody.textContent = insight.body;
    if (homeAction) {
        homeAction.textContent = insight.action;
        homeAction.dataset.actionMode = insight.actionMode;
    }

    if (progressLabel) {
        progressLabel.textContent =
            userData.plan === "pro"
            ? "TODAY'S INSIGHT • PRO"
            : "TODAY'S INSIGHT";
    }
    if (progressHeadline) progressHeadline.textContent = insight.headline;
    if (progressBody) progressBody.textContent = insight.body;
    if (progressAction) {
        progressAction.textContent = `${insight.tone} • ${insight.priority}`;
        progressAction.dataset.actionMode = insight.actionMode;
    }

    bindCoachActions();

}


function bindCoachActions() {

    const homeAction = document.getElementById("homeCoachAction");
    const progressAction = document.getElementById("progressCoachAction");

    if (homeAction && !homeAction.dataset.bound) {
        homeAction.dataset.bound = "true";
        homeAction.addEventListener("click", handleCoachActionClick);
    }

    if (progressAction && !progressAction.dataset.bound) {
        progressAction.dataset.bound = "true";
        progressAction.addEventListener("click", handleCoachActionClick);
    }

}


function handleCoachActionClick(event) {

    const actionMode =
        event.currentTarget.dataset.actionMode || "progress";

    if (actionMode === "sos") {
        if (sosButton) {
            sosButton.click();
            return;
        }
    }

    navigateToPage("progressPage");

}


// ========================================
// UX-3.1 — NOTIFICATIONS
// ========================================

function ensureNotificationData() {
    if (!Array.isArray(userData.notifications)) userData.notifications = [];

    // Seed the two former permanent Progress summaries once for existing users.
    if (!userData.notifications.some(n => n.id === "insight-stress-pattern")) {
        userData.notifications.push({
            id: "insight-stress-pattern",
            type: "insight",
            title: "New insight",
            message: "Stress may be one of your strongest vaping triggers. Try a short walk, breathing exercise, or journal entry when it appears.",
            createdAt: new Date().toISOString(),
            read: false
        });
    }
    if (!userData.notifications.some(n => n.id === "achievement-progress")) {
        userData.notifications.push({
            id: "achievement-progress",
            type: "achievement",
            title: "Making progress!",
            message: "Your recent tracking shows meaningful progress. Keep building on the small wins.",
            createdAt: new Date(Date.now() - 3600000).toISOString(),
            read: false
        });
    }
}

function addBreezyNotification(type, title, message, id) {
    ensureNotificationData();
    const notificationId = id || `${type}-${Date.now()}`;
    if (userData.notifications.some(n => n.id === notificationId)) return;
    userData.notifications.unshift({ id: notificationId, type, title, message, createdAt: new Date().toISOString(), read: false });
    userData.notifications = userData.notifications.slice(0, 30);
    saveData();
    updateNotificationUI();
}

function formatNotificationTime(value) {
    const time = new Date(value).getTime();
    if (!Number.isFinite(time)) return "Recently";
    const minutes = Math.max(0, Math.floor((Date.now() - time) / 60000));
    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
}

function renderNotifications() {
    ensureNotificationData();
    const list = document.getElementById("notificationsList");
    if (!list) return;
    const icons = { insight: "💡", achievement: "🏆", recovery: "↻", challenge: "✓", points: "✦", wellness: "♧", peer: "♡" };
    if (!userData.notifications.length) {
        list.innerHTML = '<div class="ux31-empty-notifications"><strong>No notifications yet</strong><p>Insights, achievements, and important Breezy updates will appear here.</p></div>';
        return;
    }
    list.innerHTML = userData.notifications.map(n => `
        <button type="button" class="ux31-notification-item ${n.read ? "" : "unread"}" data-notification-id="${n.id}">
            <span class="ux31-notification-icon">${icons[n.type] || "•"}</span>
            <span class="ux31-notification-copy"><strong>${n.title}</strong><span>${n.message}</span><small>${formatNotificationTime(n.createdAt)}</small></span>
            ${n.read ? "" : '<i aria-label="Unread"></i>'}
        </button>`).join("");
}

function updateNotificationUI() {
    ensureNotificationData();
    const unread = userData.notifications.filter(n => !n.read).length;
    document.querySelectorAll("[data-notification-dot]").forEach(dot => dot.classList.toggle("hidden", unread === 0));
    const summary = document.getElementById("notificationSummary");
    if (summary) summary.textContent = unread ? `${unread} unread ${unread === 1 ? "update" : "updates"}` : "You're all caught up.";
    renderNotifications();
}

// ========================================
// UX-3.5 REUSABLE BOTTOM SHEET
// ========================================
const bottomSheet = document.getElementById("bottomSheet");
const bottomSheetBackdrop = document.getElementById("bottomSheetBackdrop");
const bottomSheetTitle = document.getElementById("bottomSheetTitle");
const bottomSheetEyebrow = document.getElementById("bottomSheetEyebrow");
const bottomSheetBody = document.getElementById("bottomSheetBody");

function openBottomSheet({ title, eyebrow = "QUICK VIEW", html = "" }) {
    if (!bottomSheet || !bottomSheetBody) return;
    bottomSheetTitle.textContent = title;
    bottomSheetEyebrow.textContent = eyebrow;
    bottomSheetBody.innerHTML = html;
    bottomSheet.classList.remove("hidden");
    bottomSheetBackdrop?.classList.remove("hidden");
    document.body.classList.add("ux35-sheet-open");
}

function closeBottomSheet() {
    bottomSheet?.classList.add("hidden");
    bottomSheetBackdrop?.classList.add("hidden");
    document.body.classList.remove("ux35-sheet-open");
}

document.getElementById("closeBottomSheet")?.addEventListener("click", closeBottomSheet);
bottomSheetBackdrop?.addEventListener("click", closeBottomSheet);
document.addEventListener("keydown", event => {
    if (event.key === "Escape" && bottomSheet && !bottomSheet.classList.contains("hidden")) closeBottomSheet();
});


function openSupportCircle() {
    openBottomSheet({
        title: "Your Support Circle",
        eyebrow: "PEOPLE IN YOUR CORNER",
        html: `<div class="ux35-sheet-section support-circle-sheet">
            <p class="support-circle-sheet-copy">Your peers are here to support your progress.</p>
            <div class="support-circle-sheet-list">
                <div class="support-circle-person"><div class="mini-avatar">S</div><div><strong>Sofia</strong><span>Support buddy</span></div><button type="button" class="circle-peer-action" onclick="showToast('Sofia is in your support circle')">View</button></div>
                <div class="support-circle-person"><div class="mini-avatar">M</div><div><strong>Miguel</strong><span>Accountability peer</span></div><button type="button" class="circle-peer-action" onclick="showToast('Miguel is in your support circle')">View</button></div>
                <div class="support-circle-person"><div class="mini-avatar">C</div><div><strong>Carlo</strong><span>Support buddy</span></div><button type="button" class="circle-peer-action" onclick="showToast('Carlo is in your support circle')">View</button></div>
            </div>
        </div>`
    });
}
function toggleActivityCheer(button, name) {
    const active = button.classList.toggle("is-cheered");
    const label = button.querySelector("span");
    if (label) label.textContent = active ? "Cheered" : "Cheer";
    button.setAttribute("aria-pressed", active ? "true" : "false");
    showToast(active ? `You cheered ${name}!` : "Cheer removed");
}

function openNotifications() {
    updateNotificationUI();
    ensureNotificationData();
    const unread = userData.notifications.filter(n => !n.read).length;
    openBottomSheet({
        title: "Notifications",
        eyebrow: "WHAT'S NEW",
        html: `<div class="ux35-sheet-section">
            <div class="ux35-sheet-toolbar"><span>${unread ? `${unread} unread ${unread === 1 ? "update" : "updates"}` : "You're all caught up."}</span><button type="button" class="ux35-sheet-link" data-sheet-action="mark-read">Mark all read</button></div>
            <div id="notificationsList" class="ux31-notifications-list"></div>
        </div>
        <div class="ux35-sheet-section ux31-notifications-activity">
            <div class="section-header"><h3>Recent Activity</h3></div>
            <div class="activity-list ux31-notifications-activity-list">
                <div class="activity-card">
                    <div class="activity-avatar">S</div>
                    <div class="activity-content">
                        <p><strong>Sofia</strong> completed a 6-hour vape-free challenge!</p>
                        <span>12 minutes ago</span>
                    </div>
                <button class="activity-cheer-btn" type="button" onclick="toggleActivityCheer(this, 'Sofia')">👏 <span>Cheer</span></button></div>
                <div class="activity-card">
                    <div class="activity-avatar">M</div>
                    <div class="activity-content">
                        <p><strong>Miguel</strong> reached a 5-day streak!</p>
                        <span>1 hour ago</span>
                    </div>
                <button class="activity-cheer-btn" type="button" onclick="toggleActivityCheer(this, 'Miguel')">👏 <span>Cheer</span></button></div>
                <div class="activity-card">
                    <div class="activity-avatar">C</div>
                    <div class="activity-content">
                        <p><strong>Carlo</strong> reduced his daily sessions by 15%.</p>
                        <span>3 hours ago</span>
                    </div>
                <button class="activity-cheer-btn" type="button" onclick="toggleActivityCheer(this, 'Carlo')">👏 <span>Cheer</span></button></div>
            </div>
        </div>`
    });
    renderNotifications();
}

// Keep Notifications available from the top of every full page.
// Home already provides its own header action beside the avatar.
document.querySelectorAll(".page .page-header").forEach(header => {
    if (header.querySelector("[data-open-notifications]")) return;

    header.classList.add("ux35-page-header-notifications");

    const notificationButton = document.createElement("button");
    notificationButton.type = "button";
    notificationButton.className = "ux31-notification-button ux35-page-notification-button";
    notificationButton.setAttribute("data-open-notifications", "");
    notificationButton.setAttribute("aria-label", "Open notifications");
    notificationButton.innerHTML = `<span aria-hidden="true" class="ux35-bell">⌁</span><span class="ux31-notification-dot hidden" data-notification-dot></span>`;
    header.appendChild(notificationButton);
});

ensureNotificationData();
updateNotificationUI();
document.querySelectorAll("[data-open-notifications]").forEach(button => button.addEventListener("click", openNotifications));

function openChallengeSheet() {
    const stage = Number(userData.challengeStage) || 3;
    const day = Number(userData.challengeDay) || 0;
    const reduction = getChallengeReductionPercent();
    const percent = Math.min(100, Math.round((day / stage) * 100));
    openBottomSheet({
        title: `${stage}-Day Challenge`,
        eyebrow: "CHALLENGE DETAILS",
        html: `<div class="ux35-sheet-section">
            <div class="ux35-sheet-metrics">
                <div class="ux35-sheet-metric"><strong>${day}/${stage}</strong><span>Days completed</span></div>
                <div class="ux35-sheet-metric"><strong>${userData.streak || 0}</strong><span>Day streak</span></div>
                <div class="ux35-sheet-metric"><strong>${reduction}%</strong><span>Reduction</span></div>
            </div>
            <div class="challenge-progress-track"><div class="challenge-progress-fill" style="width:${percent}%"></div></div>
            <div class="ux35-sheet-metrics">
                <div class="ux35-sheet-metric"><strong>${userData.baselinePuffsPerDay || 0}</strong><span>Baseline puffs/day</span></div>
                <div class="ux35-sheet-metric"><strong>${userData.puffLimit || 0}</strong><span>Daily target</span></div>
            </div>
            <p class="subtitle">Breezy automatically advances your challenge after successful days. If you go above target once, Recovery Day gives you an opportunity to preserve your streak.</p>
        </div>`
    });
}

document.querySelectorAll('[data-sheet="challenge"]').forEach(button => button.addEventListener("click", openChallengeSheet));

// One delegated action handler lets future Rewards, Habits, Journal and Learn previews
// reuse this same sheet without adding more full-screen navigation.
bottomSheetBody?.addEventListener("click", event => {
    const action = event.target.closest("[data-sheet-action]")?.dataset.sheetAction;
    if (action === "mark-read") {
        ensureNotificationData();
        userData.notifications.forEach(n => n.read = true);
        saveData();
        updateNotificationUI();
        openNotifications();
        return;
    }
    const notificationItem = event.target.closest("[data-notification-id]");
    if (notificationItem) {
        const notification = userData.notifications.find(n => n.id === notificationItem.dataset.notificationId);
        if (notification) {
            notification.read = true;
            saveData();
            updateNotificationUI();
            openNotifications();
        }
    }
});

// ========================================
// PAGE NAVIGATION
// ========================================

const navItems =
    document.querySelectorAll(
        ".nav-item"
    );


const pages =
    document.querySelectorAll(
        ".page"
    );

let currentPage =
    document.querySelector(
        ".page.active-page"
    )?.id || "homePage";


function navigateToPage(
    pageId
) {
    const targetPage =
        document.getElementById(
            pageId
        );


    if (!targetPage) {

        alert(
            "This feature is coming soon!"
        );

        return;

    }

    currentPage = pageId;

    if (pageId === "progressPage") {
        updatePlanAccess();
        // Core usage reports are available to every Breezy user.
        // Render immediately whenever Progress opens.
        updateDynamicReport();
        if (userData.plan === "pro") {
            renderAICoach();
        }
    }


    pages.forEach(

        function(page) {

            page.classList.remove(
                "active-page"
            );

        }

    );


    navItems.forEach(

        function(item) {

            item.classList.remove(
                "active"
            );

        }

    );


    targetPage.classList.add(
        "active-page"
    );
    // Refresh rewards whenever
    // the Rewards page is opened

    if (
        pageId ===
        "rewardsPage"
    ) {

        updateRewards();

    }

    if (pageId === "wellnessPage") {
        renderHealthyHabits();
        renderJournal();
    }

    if (pageId === "peersPage") {
        updateSupportAvailability();
    }

    if (
    pageId ===
    "profilePage"
) {

    updateReductionPlanUI();


    reductionGoalSlider.value =
        userData.reductionGoal;


    reductionGoalValue.textContent =

        userData.reductionGoal +

        "%";


    peerNotificationToggle.checked =
        userData.peerNotifications;


    cravingSupportToggle.checked =
        userData.cravingSupport;

}

    const matchingNav =

        document.querySelector(

            '.nav-item[data-page="' +

            pageId +

            '"]'

        );


    if (matchingNav) {

        matchingNav.classList.add(
            "active"
        );

    }


    window.scrollTo({

        top: 0,

        behavior: "smooth"

    });

}


navItems.forEach(

    function(navItem) {

        navItem.addEventListener(

            "click",

            function() {

                const pageId = navItem.dataset.page;

                // Center Log action is a modal action, not a page destination.
                if (!pageId) return;

                navigateToPage(pageId);

            }

        );

    }

);


// Home partner shortcut

const peerShortcuts =

    document.querySelectorAll(
        ".go-to-peers"
    );


peerShortcuts.forEach(

    function(button) {

        button.addEventListener(

            "click",

            function() {

                navigateToPage(
                    "peersPage"
                );

            }

        );

    }

);


// ========================================
// DYNAMIC REPORT SYSTEM
// ========================================
const usageMetric = document.getElementById("usageMetric");
const weeklyAverage = document.getElementById("weeklyAverage");
const reportPeriodButtons = document.querySelectorAll(".report-period-button");
const dynamicUsageChart = document.getElementById("dynamicUsageChart");
const dynamicTriggerList = document.getElementById("dynamicTriggerList");
let selectedReportPeriod = 7;

function getSessionsBetween(startDate, endDate) {
    return userData.sessionHistory.filter(session => {
        const d = new Date(session.timestamp);
        return d >= startDate && d < endDate;
    });
}

function getPeriodData(numberOfDays, offset = 0) {
    const endDate = new Date();
    endDate.setDate(endDate.getDate() - numberOfDays * offset);
    const startDate = new Date(endDate);
    startDate.setDate(startDate.getDate() - numberOfDays);
    return getSessionsBetween(startDate, endDate);
}

function summarizeSessions(sessions, numberOfDays) {
    const totalSessions = sessions.length;
    const totalPuffs = sessions.reduce((t,s) => t + Number(s.puffs || 0), 0);
    const cravingTotal = sessions.reduce((t,s) => t + Number(s.craving || 0), 0);
    return { totalSessions, totalPuffs, averageCraving: totalSessions ? cravingTotal/totalSessions : 0, averageSessions: totalSessions/numberOfDays };
}

function calculatePercentageChange(current, previous) { return previous === 0 ? null : ((current-previous)/previous)*100; }
function updateChangeIndicator(element, change) {
    element.classList.remove("positive-change","negative-change","neutral-change");
    if (change === null) { element.textContent="No previous data"; element.classList.add("neutral-change"); return; }
    if (change === 0) { element.textContent="No change"; element.classList.add("neutral-change"); return; }
    const n=Math.abs(Math.round(change)); element.textContent=(change<0?"↓ ":"↑ ")+n+"% vs previous period";
    element.classList.add(change<0?"positive-change":"negative-change");
}

function generateChartData(numberOfDays) {
    const data=[];
    for(let i=numberOfDays-1;i>=0;i--){
        const date=new Date(); date.setHours(0,0,0,0); date.setDate(date.getDate()-i);
        const nextDate=new Date(date); nextDate.setDate(nextDate.getDate()+1);
        const sessions=getSessionsBetween(date,nextDate);
        data.push({date,sessions:sessions.length,puffs:sessions.reduce((t,s)=>t+Number(s.puffs||0),0)});
    }
    return data;
}

function renderUsageChart() {
    if(!dynamicUsageChart || !usageMetric) return;
    const metric=usageMetric.value, chartData=generateChartData(selectedReportPeriod);
    dynamicUsageChart.innerHTML="";
    const values=chartData.map(d=>d[metric]), maxValue=Math.max(...values,1);
    chartData.forEach(day=>{
        const column=document.createElement("div"); column.className="dynamic-chart-column";
        const value=day[metric];
        const valueLabel=document.createElement("span"); valueLabel.className="dynamic-chart-value"; valueLabel.textContent=value;
        const bar=document.createElement("div"); bar.className="dynamic-chart-bar"; bar.style.height=Math.max((value/maxValue)*100,2)+"%";
        const label=document.createElement("span"); label.className="dynamic-chart-label";
        label.textContent=selectedReportPeriod===1?"Today":selectedReportPeriod===7?day.date.toLocaleDateString("en-US",{weekday:"short"}):day.date.getDate();
        column.append(valueLabel,bar,label); dynamicUsageChart.appendChild(column);
    });
    const avg=values.reduce((a,b)=>a+b,0)/selectedReportPeriod;
    if(weeklyAverage) weeklyAverage.textContent=avg.toFixed(1)+(metric==="sessions"?" sessions/day":" puffs/day");
}

function renderTriggerAnalysis() {
    if(!dynamicTriggerList) return;
    const triggerData=calculateTriggers(selectedReportPeriod); dynamicTriggerList.innerHTML="";
    if(!triggerData.length){ dynamicTriggerList.innerHTML='<p class="empty-report-message">Log more sessions to discover your most common triggers.</p>'; return; }
    const total=triggerData.reduce((t,x)=>t+x[1],0);
    triggerData.slice(0,4).forEach(([name,count])=>{
        const pct=Math.round(count/total*100), item=document.createElement("div"); item.className="trigger-item";
        item.innerHTML='<div class="trigger-info"><span>'+name+'</span><span>'+pct+'%</span></div><div class="progress-bar"><div class="trigger-fill" style="width:'+pct+'%"></div></div>';
        dynamicTriggerList.appendChild(item);
    });
}

function updateDynamicReport() {
    const current=summarizeSessions(getPeriodData(selectedReportPeriod,0),selectedReportPeriod);
    const previous=summarizeSessions(getPeriodData(selectedReportPeriod,1),selectedReportPeriod);
    document.getElementById("reportSessions").textContent=current.totalSessions;
    document.getElementById("reportPuffs").textContent=current.totalPuffs;
    document.getElementById("reportCraving").textContent=current.averageCraving.toFixed(1);
    document.getElementById("reportDailyAverage").textContent=current.averageSessions.toFixed(1);
    updateChangeIndicator(document.getElementById("sessionChange"),calculatePercentageChange(current.totalSessions,previous.totalSessions));
    updateChangeIndicator(document.getElementById("puffChange"),calculatePercentageChange(current.totalPuffs,previous.totalPuffs));
    renderUsageChart(); renderTriggerAnalysis();
}

reportPeriodButtons.forEach(button=>button.addEventListener("click",()=>{
    selectedReportPeriod=Number(button.dataset.period);
    reportPeriodButtons.forEach(b=>b.classList.remove("active-period")); button.classList.add("active-period");
    const title=document.getElementById("reportPeriodTitle"), comp=document.getElementById("reportComparisonLabel"), chartTitle=document.getElementById("usageChartTitle");
    if(selectedReportPeriod===1){title.textContent="Today";comp.textContent="vs. Yesterday";chartTitle.textContent="Today's Usage";}
    else if(selectedReportPeriod===7){title.textContent="This Week";comp.textContent="vs. Last Week";chartTitle.textContent="Weekly Usage";}
    else{title.textContent="This Month";comp.textContent="vs. Last Month";chartTitle.textContent="Monthly Usage";}
    updateDynamicReport();
}));
if(usageMetric) usageMetric.addEventListener("change",renderUsageChart);

// ========================================
// PEER ENCOURAGEMENT
// ========================================

const encouragePartner =

    document.getElementById(
        "encouragePartner"
    );


const partnerMessage =

    document.getElementById(
        "partnerMessage"
    );


encouragePartner.addEventListener(

    "click",

    function() {

        const earnedPoints = awardOncePerDay(
            "peerEncouragementDates",
            10
        );


        encouragePartner.textContent =
            "✓ Encouragement Sent";


        encouragePartner.disabled =
            true;


        const preset = document.getElementById("encouragementPreset");
        const selectedMessage = preset ? preset.value : "Keep going! You’re making progress one day at a time. 💚";

        partnerMessage.textContent =
            'You sent Miguel: "' + selectedMessage + '"';


        alert(

            "Encouragement sent to Miguel!\n\n" +
            (earnedPoints ? "+" + earnedPoints + " BreezyPoints for supporting a peer." : "Today's encouragement reward was already earned.")

        );

    }

);


// ========================================
// ACTIVITY CHEERS
// ========================================

const cheerButtons =

    document.querySelectorAll(
        ".cheer-button"
    );


cheerButtons.forEach(

    function(button) {

        button.addEventListener(

            "click",

            function() {

                if (
                    button.classList.contains(
                        "cheered"
                    )
                ) {

                    return;

                }


                button.classList.add(
                    "cheered"
                );


                button.textContent =
                    "✓";


                const achievementKey =
                    (button.dataset.achievement || button.dataset.name || "peer") +
                    "-" + Array.from(cheerButtons).indexOf(button);

                let earnedPoints = 0;
                if (!userData.rewardLedger.celebratedAchievements.includes(achievementKey)) {
                    earnedPoints = awardPoints(10);
                    userData.rewardLedger.celebratedAchievements.push(achievementKey);
                    saveData();
                }


                alert(

                    "You cheered for " +

                    button.dataset.name +

                    "!\n\n+10 points for supporting your community."

                );

            }

        );

    }

);


// ========================================
// SOS CRAVING SUPPORT
// ========================================

const sosButton =
    document.getElementById(
        "sosButton"
    );


const sosModal =
    document.getElementById(
        "sosModal"
    );


const closeSosModal =
    document.getElementById(
        "closeSosModal"
    );


const breathingButton =
    document.getElementById(
        "breathingButton"
    );


const delayButton =
    document.getElementById(
        "delayButton"
    );


const messagePartnerButton =
    document.getElementById(
        "messagePartnerButton"
    );


const supportResult =
    document.getElementById(
        "supportResult"
    );


const supportHeroState =
    document.getElementById(
        "supportHeroState"
    );


const supportQuickActionButtons =
    document.querySelectorAll(
        ".support-chip[data-support-action]"
    );


function updateSupportAvailability() {
    const isEnabled = !!userData.cravingSupport;

    if (sosButton) {
        sosButton.disabled = !isEnabled;
        sosButton.textContent = isEnabled ? "I Need Support" : "Craving Support Off";
    }

    supportQuickActionButtons.forEach(function(button) {
        button.disabled = !isEnabled;
    });

    if (supportHeroState) {
        supportHeroState.textContent = isEnabled
            ? "Craving Support is on."
            : "Craving Support is off in Profile.";
    }
}

updateSupportAvailability();


function openSupportModalAction(action) {
    if (!userData.cravingSupport) {
        alert(
            "Craving Support is currently disabled.\n\n" +
            "You can enable it again from Profile & Goals."
        );
        return;
    }

    if (sosButton) {
        sosButton.click();
    }

    if (action === "breathing" && breathingButton) {
        breathingButton.click();
    } else if (action === "delay" && delayButton) {
        delayButton.click();
    } else if (action === "partner" && messagePartnerButton) {
        messagePartnerButton.click();
    }
}



sosButton.addEventListener(

    "click",

    function() {


        if (
            !userData.cravingSupport
        ) {

            alert(

                "Craving Support is currently disabled.\n\n" +

                "You can enable it again from Profile & Goals."

            );

            return;

        }


        supportResult.classList.add(
            "hidden"
        );


        sosModal.classList.remove(
            "hidden"
        );

    }

);


closeSosModal.addEventListener(

    "click",

    function() {

        sosModal.classList.add(
            "hidden"
        );

    }

);

supportQuickActionButtons.forEach(
    function(button) {
        button.addEventListener(
            "click",
            function() {
                openSupportModalAction(button.dataset.supportAction);
            }
        );
    }
);


// ========================================
// BREATHING SUPPORT
// ========================================

breathingButton.addEventListener(

    "click",

    function() {

        supportResult.classList.remove(
            "hidden"
        );


        supportResult.innerHTML =

            "<strong>Let's slow down together.</strong><br><br>" +

            "Breathe in slowly for 4 seconds.<br>" +

            "Hold for 4 seconds.<br>" +

            "Breathe out slowly for 4 seconds.<br><br>" +

            "Repeat this a few times and notice how you feel.";

    }

);


// ========================================
// DELAY CHALLENGE
// ========================================

delayButton.addEventListener(

    "click",

    function() {

        supportResult.classList.remove(
            "hidden"
        );


        supportResult.innerHTML =

            "<strong>5-minute delay started! ⏱</strong><br><br>" +

            "For the next five minutes, try doing something else. " +

            "Take a walk, drink water, listen to music, or message a friend.<br><br>" +

            "Every minute you delay is progress.";

    }

);


// ========================================
// MESSAGE PARTNER
// ========================================

messagePartnerButton.addEventListener(

    "click",

    function() {

        supportResult.classList.remove(
            "hidden"
        );


        supportResult.innerHTML =

            "<strong>Message sent to Miguel 💬</strong><br><br>" +

            '"Hey, I\'m having a craving right now. Could use some support."';


        setTimeout(

            function() {

                supportResult.innerHTML +=

                    "<br><br><strong>Miguel:</strong> " +

                    '"You\'ve got this! Try waiting a few minutes. I\'m here if you need me. 💪"';

            },

            1500

        );

    }

);


// ========================================
// CLOSE MODALS BY CLICKING BACKDROP
// ========================================

window.addEventListener(

    "click",

    function(event) {

        if (
            event.target ===
            logModal
        ) {

            logModal.classList.add(
                "hidden"
            );

        }


        if (
            event.target ===
            sosModal
        ) {

            sosModal.classList.add(
                "hidden"
            );

        }

    }

);

// ========================================
// REWARDS SYSTEM
// ========================================

const pointsBalance =
    document.getElementById(
        "pointsBalance"
    );


const levelProgress =
    document.getElementById(
        "levelProgress"
    );


const levelProgressText =
    document.getElementById(
        "levelProgressText"
    );


const pointsUntilNext =
    document.getElementById(
        "pointsUntilNext"
    );


const redeemButtons =
    document.querySelectorAll(
        ".redeem-button"
    );


// Track purchased rewards

let unlockedRewards = userData.unlockedRewards || [];

function updateReductionPlanUI() {

    const baselineElement =
        document.getElementById(
            "profileBaselinePuffs"
        );

    const puffTargetElement =
        document.getElementById(
            "profilePuffLimit"
        );

    const sessionTargetElement =
        document.getElementById(
            "profileSessionLimit"
        );


    if (baselineElement) {

        baselineElement.textContent =
            userData.baselinePuffsPerDay +
            " puffs/day";

    }


    if (puffTargetElement) {

        puffTargetElement.textContent =
            userData.puffLimit +
            " puffs/day";

    }


    if (sessionTargetElement) {

        sessionTargetElement.textContent =
            userData.sessionLimit +
            " sessions/day";

    }

}
// ========================================
// UPDATE REWARDS PAGE
// ========================================

function updateRewards() {

    pointsBalance.textContent =

        userData.points.toLocaleString();


   // ========================================
// DYNAMIC LEVEL SYSTEM
// ========================================

const levels = [

    {
        level: 1,
        name: "Fresh Start",
        minXP: 0,
        nextXP: 250
    },

    {
        level: 2,
        name: "First Steps",
        minXP: 250,
        nextXP: 500
    },

    {
        level: 3,
        name: "Building Momentum",
        minXP: 500,
        nextXP: 1000
    },

    {
        level: 4,
        name: "Mindful Breather",
        minXP: 1000,
        nextXP: 1500
    },

    {
        level: 5,
        name: "Habit Breaker",
        minXP: 1500,
        nextXP: 2500
    },

    {
        level: 6,
        name: "Breathe Champion",
        minXP: 2500,
        nextXP: 5000
    }

];


let currentLevel =
    levels[0];


for (
    let i = 0;
    i < levels.length;
    i++
) {

    if (
        userData.totalXP >=
        levels[i].minXP
    ) {

        currentLevel =
            levels[i];

    }

}


const levelBadge =
    document.getElementById(
        "levelBadge"
    );


const levelNumber =
    document.getElementById(
        "levelNumber"
    );


const levelName =
    document.getElementById(
        "levelName"
    );


const levelLabel =
    document.getElementById(
        "levelLabel"
    );


levelBadge.textContent =
    "LVL " +
    currentLevel.level;

const profileLevel =
    document.getElementById(
        "profileLevel"
    );


if (profileLevel) {

    profileLevel.textContent =

        "LVL " +

        currentLevel.level;

}


levelNumber.textContent =
    "LEVEL " +
    currentLevel.level;


levelName.textContent =
    currentLevel.name;


levelLabel.textContent =
    currentLevel.name;


// Calculate progress within current level

let xpIntoLevel =

    userData.totalXP -

    currentLevel.minXP;


let xpNeededForLevel =

    currentLevel.nextXP -

    currentLevel.minXP;


let levelPercentage =

    (
        xpIntoLevel /

        xpNeededForLevel

    ) * 100;


levelPercentage =

    Math.min(
        levelPercentage,
        100
    );


levelProgress.style.width =

    levelPercentage +

    "%";


levelProgressText.textContent =

    userData.totalXP.toLocaleString() +

    " / " +

    currentLevel.nextXP.toLocaleString() +

    " XP";


let remaining =

    Math.max(

        currentLevel.nextXP -

        userData.totalXP,

        0

    );


pointsUntilNext.textContent =

    remaining.toLocaleString();

    // Update reward buttons

    redeemButtons.forEach(

        function(button) {


            const cost =

                Number(
                    button.dataset.cost
                );


            const reward =

                button.dataset.reward;


            // Already purchased

            if (
                unlockedRewards.includes(
                    reward
                )
            ) {

                button.textContent =
                    "✓ Unlocked";


                button.disabled =
                    true;

            }


            // Not enough points

            else if (
                userData.points <
                cost
            ) {

                button.textContent =

                    "🔒 " +

                    cost.toLocaleString();


                button.disabled =
                    true;

            }


            // Can purchase

            else {

                button.textContent =

                    "⭐ " +

                    cost.toLocaleString();


                button.disabled =
                    false;

            }

        }

    );

}


// ========================================
// REDEEM REWARDS
// ========================================

redeemButtons.forEach(

    function(button) {


        button.addEventListener(

            "click",

            function() {


                const cost =

                    Number(
                        button.dataset.cost
                    );


                const reward =

                    button.dataset.reward;


                if (
                    userData.points <
                    cost
                ) {

                    alert(

                        "You don't have enough points yet."

                    );

                    return;

                }


                // Deduct points

                userData.points -= cost;


                // Unlock reward

                unlockedRewards.push(
                    reward
                );

                userData.unlockedRewards =
                    unlockedRewards;

                saveData();


                // Refresh rewards page

                updateRewards();


                alert(

                    "Reward unlocked! 🎉\n\n" +

                    reward +

                    "\n\n" +

                    cost +

                    " BreezyPoints redeemed."

                );

            }

        );

    }

);

// ========================================
// PROFILE & GOALS
// ========================================

const profileSessionLimit =
    document.getElementById(
        "profileSessionLimit"
    );


const profilePuffLimit =
    document.getElementById(
        "profilePuffLimit"
    );


const reductionGoalSlider =
    document.getElementById(
        "reductionGoalSlider"
    );


const reductionGoalValue =
    document.getElementById(
        "reductionGoalValue"
    );


const reductionGoalSection =
    document.getElementById(
        "reductionGoalSection"
    );


const profileGoalSummary =
    document.getElementById(
        "profileGoalSummary"
    );


const peerNotificationToggle =
    document.getElementById(
        "peerNotificationToggle"
    );


const cravingSupportToggle =
    document.getElementById(
        "cravingSupportToggle"
    );


const saveProfileButton =
    document.getElementById(
        "saveProfileButton"
    );


const connectDeviceButton =
    document.getElementById(
        "connectDeviceButton"
    );


const goalRadios =
    document.querySelectorAll(
        'input[name="goalType"]'
    );


// Temporary editable settings

let tempSessionLimit =
    userData.sessionLimit;


let tempPuffLimit =
    userData.puffLimit;


// ========================================
// REDUCTION SLIDER
// ========================================

reductionGoalSlider.addEventListener(

    "input",

    function() {

        reductionGoalValue.textContent =

            reductionGoalSlider.value +

            "%";

    }

);


// ========================================
// GOAL TYPE
// ========================================

goalRadios.forEach(

    function(radio) {

        radio.addEventListener(

            "change",

            function() {

                if (
                    radio.value ===
                    "quit"
                ) {

                    reductionGoalSection.style.display =
                        "none";

                }

                else {

                    reductionGoalSection.style.display =
                        "block";

                }

            }

        );

    }

);


// ========================================
// SAVE PROFILE
// ========================================

saveProfileButton.addEventListener(

    "click",

    function() {


        const selectedGoal =

            document.querySelector(

                'input[name="goalType"]:checked'

            ).value;


        userData.goalType =
            selectedGoal;




        userData.reductionGoal =

            Number(

                reductionGoalSlider.value

            );

        // Recalculate the current stage target without
        // skipping ahead in the challenge progression.
        updateChallengeTarget();
        updateReductionPlanUI();
        updateChallengeUI();


        userData.peerNotifications =

            peerNotificationToggle.checked;


        userData.cravingSupport =

            cravingSupportToggle.checked;

        updateSupportAvailability();


        // Update Home limits

        document.getElementById(
            "sessionLimit"
        ).textContent =

            userData.sessionLimit;


        document.getElementById(
            "puffLimit"
        ).textContent =

            userData.puffLimit;


        // Update profile summary

        if (
            userData.goalType ===
            "quit"
        ) {

            profileGoalSummary.textContent =

                "Working toward becoming vape-free";

        }

        else {

            profileGoalSummary.textContent =

                "Reducing vaping by " +

                userData.reductionGoal +

                "%";

        }


        // Refresh Home dashboard

        updateDashboard();
        saveData();


        alert(

            "Your goals have been saved! ✓"

        );

    }

);


// ========================================
// DEVICE PLACEHOLDER
// ========================================

connectDeviceButton.addEventListener(

    "click",

    function() {

        alert(

            "Smart device integration is planned for a future version.\n\n" +

            "A compatible Bluetooth-enabled controller could eventually support automatic usage tracking and timed access controls."

        );

    }

);

// ========================================
// ONBOARDING
// ========================================

const onboarding =
    document.getElementById(
        "onboarding"
    );


const onboardingSteps =
    document.querySelectorAll(
        ".onboarding-step"
    );


const onboardingNextButtons =
    document.querySelectorAll(
        ".onboarding-next"
    );


function showOnboardingStep(
    stepId
) {

    onboardingSteps.forEach(

        function(step) {

            step.classList.remove(
                "active-onboarding-step"
            );

        }

    );


    document.getElementById(
        stepId
    ).classList.add(
        "active-onboarding-step"
    );


    onboarding.scrollTop = 0;

}


// Generic next buttons

onboardingNextButtons.forEach(

    function(button) {

        button.addEventListener(

            "click",

            function() {

                showOnboardingStep(

                    button.dataset.next

                );

            }

        );

    }

);

// ========================================
// ONBOARDING BASELINE CALCULATOR
// ========================================

const onboardingBaselineSessions =
    document.getElementById(
        "onboardingBaselineSessions"
    );

const onboardingBaselinePuffs =
    document.getElementById(
        "onboardingBaselinePuffs"
    );

const onboardingBaselineTotal =
    document.getElementById(
        "onboardingBaselineTotal"
    );

const onboardingStartingTarget =
    document.getElementById(
        "onboardingStartingTarget"
    );


function calculateOnboardingBaseline() {

    if (
        !onboardingBaselineSessions ||
        !onboardingBaselinePuffs
    ) {
        return;
    }

    const sessions =
        Math.max(
            1,
            Number(
                onboardingBaselineSessions.value
            ) || 1
        );

    const puffsPerSession =
        Math.max(
            1,
            Number(
                onboardingBaselinePuffs.value
            ) || 1
        );

    const baselinePuffsPerDay =
        sessions *
        puffsPerSession;

    // Breezy starts users with a manageable
    // 10% reduction from their baseline.
    const startingPuffTarget =
        Math.max(
            1,
            Math.round(
                baselinePuffsPerDay * 0.90
            )
        );

    if (onboardingBaselineTotal) {

        onboardingBaselineTotal.textContent =
            baselinePuffsPerDay +
            " puffs/day";

    }

    if (onboardingStartingTarget) {

        onboardingStartingTarget.textContent =
            startingPuffTarget +
            " puffs/day";

    }

}


if (onboardingBaselineSessions) {

    onboardingBaselineSessions.addEventListener(
        "input",
        calculateOnboardingBaseline
    );

}


if (onboardingBaselinePuffs) {

    onboardingBaselinePuffs.addEventListener(
        "input",
        calculateOnboardingBaseline
    );

}


calculateOnboardingBaseline();

// ========================================
// PROFILE
// ========================================

const profileContinueButton =
    document.getElementById(
        "profileContinueButton"
    );


profileContinueButton.addEventListener(

    "click",

    function() {


        const name =
            document.getElementById(
                "onboardingName"
            ).value.trim();


        const birthdate =
            document.getElementById(
                "onboardingBirthdate"
            ).value;


        if (
            !name ||
            !birthdate
        ) {

            alert(

                "Please enter your name and date of birth."

            );

            return;

        }


        const today =
            new Date();


        const birth =
            new Date(
                birthdate
            );


        let age =

            today.getFullYear() -

            birth.getFullYear();


        const monthDifference =

            today.getMonth() -

            birth.getMonth();


        if (

            monthDifference < 0 ||

            (
                monthDifference === 0 &&

                today.getDate() <
                birth.getDate()
            )

        ) {

            age--;

        }


        if (
            age < 18
        ) {

            alert(

                "You must be at least 18 years old to continue with this prototype."

            );

            return;

        }


        userData.name =
            name;


        updateUserNameUI();


        userData.birthdate =
            birthdate;


        showOnboardingStep(

            "onboardingVerification"

        );

    }

);


// ========================================
// ID UPLOAD
// ========================================

const validIdUpload =
    document.getElementById(
        "validIdUpload"
    );


const uploadedFileName =
    document.getElementById(
        "uploadedFileName"
    );


validIdUpload.addEventListener(

    "change",

    function() {


        if (
            validIdUpload.files.length > 0
        ) {

            uploadedFileName.textContent =

                "✓ " +

                validIdUpload.files[0].name;

        }

    }

);


// ========================================
// AGE VERIFICATION
// ========================================

const verificationContinueButton =
    document.getElementById(
        "verificationContinueButton"
    );


verificationContinueButton.addEventListener(

    "click",

    function() {


        const ageConfirmation =

            document.getElementById(
                "ageConfirmation"
            );


        if (
            validIdUpload.files.length === 0
        ) {

            alert(

                "Please submit a valid ID to continue."

            );

            return;

        }


        if (
            !ageConfirmation.checked
        ) {

            alert(

                "Please confirm that you are at least 18 years old."

            );

            return;

        }


        // DEMO ONLY:
        // No ID is actually uploaded or stored.

        userData.ageVerified =
            true;


        showOnboardingStep(

            "onboardingPrivacy"

        );

    }

);


// ========================================
// PRIVACY
// ========================================

const privacyContinueButton =
    document.getElementById(
        "privacyContinueButton"
    );


privacyContinueButton.addEventListener(

    "click",

    function() {


        const privacyConsent =

            document.getElementById(
                "privacyConsent"
            );


        const termsConsent =

            document.getElementById(
                "termsConsent"
            );


        if (

            !privacyConsent.checked ||

            !termsConsent.checked

        ) {

            alert(

                "Please review and accept the Privacy Notice and Terms of Use to continue."

            );

            return;

        }


        userData.privacyConsent =
            true;


        showOnboardingStep(

            "onboardingGoal"

        );

    }

);


// Privacy notice demo

document.getElementById(
    "viewPrivacyButton"
).addEventListener(

    "click",

    function() {

        alert(

            "Breezy Privacy Notice — Prototype\n\n" +

            "This prototype demonstrates how user information may be handled in the proposed application.\n\n" +

            "A production version should clearly explain what data is collected, why it is collected, how long it is retained, who it may be shared with, and how users may exercise their data privacy rights.\n\n" +

            "Identity documents should only be processed for legitimate verification purposes using appropriate security safeguards."

        );

    }

);


// ========================================
// COMPLETE ONBOARDING
// ========================================

function completeOnboarding(
    selectedPlan
) {


    const selectedGoal =

        document.querySelector(

            'input[name="onboardingGoal"]:checked'

        ).value;


    const baselineSessions =

    Math.max(
        1,
        Number(
            document.getElementById(
                "onboardingBaselineSessions"
            ).value
        ) || 1
    );


const baselinePuffsPerSession =

    Math.max(
        1,
        Number(
            document.getElementById(
                "onboardingBaselinePuffs"
            ).value
        ) || 1
    );


const baselinePuffsPerDay =

    baselineSessions *
    baselinePuffsPerSession;


// Breezy begins with a manageable
// 10% reduction from baseline.

const initialReductionPercent =
    10;


const startingPuffTarget =

    Math.max(
        1,
        Math.round(
            baselinePuffsPerDay *
            (
                1 -
                initialReductionPercent / 100
            )
        )
    );


const startingSessionTarget =

    Math.max(
        1,
        Math.round(
            baselineSessions *
            (
                1 -
                initialReductionPercent / 100
            )
        )
    );


    userData.goalType =
        selectedGoal;


    // Save the user's actual starting baseline

userData.baselineSessionsPerDay =
    baselineSessions;


userData.baselinePuffsPerSession =
    baselinePuffsPerSession;


userData.baselinePuffsPerDay =
    baselinePuffsPerDay;


// Breezy-generated starting reduction plan

userData.reductionGoal =
    initialReductionPercent;


userData.sessionLimit =
    startingSessionTarget;


userData.puffLimit =
    startingPuffTarget;


    // Start the automatic Breezy challenge progression
    userData.challengeStage = 3;
    userData.challengeDay = 0;
    userData.completedChallengeStages = 0;
    userData.completed21DayCycles = 0;
    userData.currentReductionPercent = initialReductionPercent;
    userData.challengeStartDate = new Date().toISOString();
    userData.lastChallengeEvaluationDate = null;


    if (
        selectedPlan === "pro" &&
        userData.vapeCapConnected
    ) {

        userData.plan =
            "pro";

        updatePlanAccess();

    }
    

    else {

        userData.plan =
            "free";

    }


    userData.onboardingComplete =
        true;


    document.getElementById(
        "sessionLimit"
    ).textContent =

        userData.sessionLimit;


    document.getElementById(
        "puffLimit"
    ).textContent =

        userData.puffLimit;


    updateDashboard();

    saveData();

    onboarding.style.display =
        "none";


    alert(

        "Welcome to Breezy, " +

        userData.name +

        "! 🌿"

    );

}


// FREE

document.getElementById(
    "chooseFreeButton"
).addEventListener(

    "click",

    function() {

        completeOnboarding(
            "free"
        );

    }

);

// ========================================
// FREE / PRO SYSTEM
// ========================================

const proModal =
    document.getElementById(
        "proModal"
    );


const exploreProButton =
    document.getElementById(
        "exploreProButton"
    );


const upgradeProButton =
    document.getElementById(
        "upgradeProButton"
    );


const closeProModal =
    document.getElementById(
        "closeProModal"
    );


const continueFreeFromPro =
    document.getElementById(
        "continueFreeFromPro"
    );


const proPreviewButton =
    document.getElementById(
        "proPreviewButton"
    );


function openProModal() {

    proModal.classList.remove(
        "hidden"
    );

}


function closePro() {

    proModal.classList.add(
        "hidden"
    );

}


const progressUpgradeButton =
    document.getElementById(
        "progressUpgradeButton"
    );

if (progressUpgradeButton) {
    progressUpgradeButton.addEventListener(
        "click",
        openProModal
    );
}


exploreProButton.addEventListener(

    "click",

    openProModal

);


upgradeProButton.addEventListener(

    "click",

    openProModal

);


closeProModal.addEventListener(

    "click",

    closePro

);


// Continue Free during onboarding

continueFreeFromPro.addEventListener(

    "click",

    function() {

        closePro();


        if (
            !userData.onboardingComplete
        ) {

            completeOnboarding(
                "free"
            );

        }

    }

);


// PRO Preview

proPreviewButton.addEventListener(

    "click",

    function() {


        const activationCode =

            prompt(

                "Enter your Breezy Cap activation code.\n\n" +

                "For this prototype, enter: DEMO-PRO"

            );


        if (
            activationCode !==
            "DEMO-PRO"
        ) {

            alert(

                "Invalid Breezy Cap activation code."

            );

            return;

        }


        userData.vapeCapConnected =
            true;


        userData.plan =
            "pro";


        saveData();
        refreshAllUI();


        document.getElementById(
            "currentPlanText"
        ).textContent =

            "Breezy PRO";


        closePro();


        if (
            !userData.onboardingComplete
        ) {

            completeOnboarding(
                "pro"
            );

        }


        alert(

            "Breezy Cap activated! 🧢✨\n\n" +

            "Breezy PRO has been unlocked.\n\n" +

            "You now have access to advanced reports, AI insights, real-world rewards, and 2× BreezyPoints."

        );

    }

);

// ========================================
// PLAN ACCESS CONTROL
// ========================================

function updatePlanAccess() {
    const realWorldRewards =

    document.getElementById(
        "realWorldRewards"
    );


// const realRewardLock =

//     document.getElementById(
//         "realRewardLock"
//     );


// if (
//     userData.plan === "pro"
// ) {

//     realWorldRewards.style.display =
//         "block";


//     realRewardLock.style.display =
//         "none";

// }

// else {

//     realWorldRewards.style.display =
//         "none";


//     realRewardLock.style.display =
//         "flex";

// }

    const proProgressLock =

        document.getElementById(
            "proProgressLock"
        );


    const advancedProgressContent =

        document.getElementById(
            "advancedProgressContent"
        );


    // Progress & Insights is part of Breezy's core free experience.
    // Individual premium tools inside this page can still carry PRO badges,
    // but the user's tracking reports and reduction progress are never locked.
    if (proProgressLock) {
        proProgressLock.classList.add("hidden");
    }

    if (advancedProgressContent) {
        advancedProgressContent.style.display = "block";
    }

    if (
        currentPage === "progressPage"
    ) {
        renderAICoach();
    }

}


// ========================================
// USER PROFILE UI
// ========================================

function updateUserNameUI() {
    const displayName = userData.name || "User";
    const firstInitial = displayName.charAt(0).toUpperCase();

    const homeUserName = document.getElementById("homeUserName");
    const profileUserName = document.getElementById("profileUserName");
    const motivationUserName = document.getElementById("motivationUserName");
    const headerAvatar = document.getElementById("headerAvatar");
    const profileAvatar = document.getElementById("profileAvatar");

    if (homeUserName) homeUserName.textContent = displayName;
    if (profileUserName) profileUserName.textContent = displayName;
    if (motivationUserName) motivationUserName.textContent = displayName;
    if (headerAvatar) headerAvatar.textContent = firstInitial;
    if (profileAvatar) profileAvatar.textContent = firstInitial;
}


// ========================================
// DEVELOPER DEMO MODE
// ========================================

const developerModal =
    document.getElementById("developerModal");

const closeDeveloperModal =
    document.getElementById("closeDeveloperModal");

const generateDemoDataButton =
    document.getElementById("generateDemoDataButton");

const restoreRealDataButton =
    document.getElementById("restoreRealDataButton");

const demoModeStatus =
    document.getElementById("demoModeStatus");

const demoModeDescription =
    document.getElementById("demoModeDescription");

const demoModeBadge =
    document.getElementById("demoModeBadge");

let developerTapCount = 0;
let developerTapTimer = null;


function deepCloneData(data) {

    return JSON.parse(
        JSON.stringify(data)
    );

}


function randomInteger(min, max) {

    return Math.floor(
        Math.random() * (max - min + 1)
    ) + min;

}


function weightedChoice(weightedItems) {

    const totalWeight = weightedItems.reduce(
        (total, item) => total + item.weight,
        0
    );

    let roll = Math.random() * totalWeight;

    for (const item of weightedItems) {

        roll -= item.weight;

        if (roll <= 0) {
            return item.value;
        }

    }

    return weightedItems[
        weightedItems.length - 1
    ].value;

}


function getDemoTrigger(dayOfWeek, hour) {

    const isWeekend =
        dayOfWeek === 0 ||
        dayOfWeek === 6;

    if (isWeekend) {

        return weightedChoice([
            { value: "Boredom", weight: 30 },
            { value: "Friends", weight: 28 },
            { value: "Habit", weight: 18 },
            { value: "Craving", weight: 12 },
            { value: "After Meal", weight: 8 },
            { value: "Stress", weight: 4 }
        ]);

    }

    if (hour >= 16 && hour <= 22) {

        return weightedChoice([
            { value: "Academic Pressure", weight: 34 },
            { value: "Stress", weight: 30 },
            { value: "Habit", weight: 14 },
            { value: "Craving", weight: 12 },
            { value: "Friends", weight: 6 },
            { value: "After Meal", weight: 4 }
        ]);

    }

    return weightedChoice([
        { value: "Stress", weight: 27 },
        { value: "Academic Pressure", weight: 24 },
        { value: "Habit", weight: 20 },
        { value: "Craving", weight: 14 },
        { value: "After Meal", weight: 10 },
        { value: "Boredom", weight: 5 }
    ]);

}


function getDemoSessionHour(dayOfWeek) {

    const isWeekend =
        dayOfWeek === 0 ||
        dayOfWeek === 6;

    if (isWeekend) {

        return weightedChoice([
            { value: randomInteger(10, 13), weight: 20 },
            { value: randomInteger(14, 17), weight: 30 },
            { value: randomInteger(18, 23), weight: 50 }
        ]);

    }

    return weightedChoice([
        { value: randomInteger(7, 10), weight: 12 },
        { value: randomInteger(11, 15), weight: 23 },
        { value: randomInteger(16, 19), weight: 43 },
        { value: randomInteger(20, 23), weight: 22 }
    ]);

}


function generateDemoHistory() {

    const generatedHistory = [];

    const today = new Date();
    today.setHours(12, 0, 0, 0);

    for (
        let daysAgo = 29;
        daysAgo >= 0;
        daysAgo--
    ) {

        const date = new Date(today);

        date.setDate(
            date.getDate() - daysAgo
        );

        const dayOfWeek =
            date.getDay();

        const isWeekend =
            dayOfWeek === 0 ||
            dayOfWeek === 6;

        // progressRatio grows from 0 at the beginning
        // of the demo month to 1 near the present.
        const progressRatio =
            (29 - daysAgo) / 29;

        let expectedSessions =
            9.2 - (progressRatio * 4.1);

        if (isWeekend) {
            expectedSessions += 1.4;
        }

        // Simulate difficult school days.
        if (
            dayOfWeek === 1 ||
            dayOfWeek === 4
        ) {
            expectedSessions += 0.8;
        }

        // Add occasional realistic setbacks.
        if (Math.random() < 0.13) {
            expectedSessions += randomInteger(2, 4);
        }

        const dailySessions =
            Math.max(
                2,
                Math.round(
                    expectedSessions +
                    (Math.random() * 3 - 1.5)
                )
            );

        for (
            let sessionIndex = 0;
            sessionIndex < dailySessions;
            sessionIndex++
        ) {

            const hour =
                getDemoSessionHour(dayOfWeek);

            const timestamp =
                new Date(date);

            timestamp.setHours(
                hour,
                randomInteger(0, 59),
                randomInteger(0, 59),
                0
            );

            const trigger =
                getDemoTrigger(
                    dayOfWeek,
                    hour
                );

            let cravingBase =
                7.4 - (progressRatio * 2.2);

            if (
                trigger === "Stress" ||
                trigger === "Academic Pressure"
            ) {
                cravingBase += 1;
            }

            if (hour >= 20) {
                cravingBase += 0.5;
            }

            const craving =
                Math.max(
                    1,
                    Math.min(
                        10,
                        Math.round(
                            cravingBase +
                            (Math.random() * 3 - 1.5)
                        )
                    )
                );

            const puffBase =
                8.5 - (progressRatio * 2.4);

            const puffs =
                Math.max(
                    2,
                    Math.round(
                        puffBase +
                        craving * 0.35 +
                        (Math.random() * 4 - 2)
                    )
                );

            generatedHistory.push({
                id:
                    timestamp.getTime() +
                    sessionIndex,

                timestamp:
                    timestamp.toISOString(),

                puffs:
                    puffs,

                cravingLevel:
                    Math.max(
                        1,
                        Math.min(
                            5,
                            Math.round(craving / 2)
                        )
                    ),

                craving:
                    craving,

                trigger:
                    trigger,

                demoGenerated:
                    true
            });

        }

    }

    return generatedHistory.sort(
        (a, b) =>
            new Date(a.timestamp) -
            new Date(b.timestamp)
    );

}




function updateDeveloperAnalyticsPreview() {

    const averageElement =
        document.getElementById(
            "demoAnalyticsAverage"
        );

    const reductionElement =
        document.getElementById(
            "demoAnalyticsReduction"
        );

    const triggerElement =
        document.getElementById(
            "demoAnalyticsTrigger"
        );

    const adherenceElement =
        document.getElementById(
            "demoAnalyticsAdherence"
        );

    if (
        !averageElement ||
        !reductionElement ||
        !triggerElement ||
        !adherenceElement
    ) {
        return;
    }

    if (
        typeof analyzeUsage !== "function"
    ) {
        return;
    }

    const analytics =
        analyzeUsage(30);

    averageElement.textContent =
        analytics.averageSessionsPerDay +
        " / day";

    reductionElement.textContent =
        analytics.reductionPercent +
        "%";

    triggerElement.textContent =
        analytics.topTrigger.trigger;

    adherenceElement.textContent =
        analytics.goalAdherence +
        "%";

}

function updateDemoModeUI() {

    if (
        !demoModeStatus ||
        !demoModeDescription ||
        !demoModeBadge
    ) {
        return;
    }

    if (userData.demoMode) {

        demoModeStatus.textContent =
            "Demo Mode Active";

        demoModeDescription.textContent =
            "A generated 30-day presentation dataset is currently loaded.";

        demoModeBadge.textContent =
            "ACTIVE";

        demoModeBadge.classList.add(
            "active-demo-badge"
        );

        if (generateDemoDataButton) {
            generateDemoDataButton.textContent =
                "Regenerate 30-Day Demo Data";
        }

        if (restoreRealDataButton) {
            restoreRealDataButton.disabled =
                false;
        }

    }

    else {

        demoModeStatus.textContent =
            "Demo Mode Off";

        demoModeDescription.textContent =
            "Your current app data is unchanged.";

        demoModeBadge.textContent =
            "OFF";

        demoModeBadge.classList.remove(
            "active-demo-badge"
        );

        if (generateDemoDataButton) {
            generateDemoDataButton.textContent =
                "Generate 30-Day Demo Data";
        }

        if (restoreRealDataButton) {
            restoreRealDataButton.disabled =
                !userData.demoBackup;
        }

    }

    updateDeveloperAnalyticsPreview();

}


function refreshAllUI() {

    updateUserNameUI();

    document.getElementById(
        "sessionLimit"
    ).textContent =
        userData.sessionLimit;

    document.getElementById(
        "puffLimit"
    ).textContent =
        userData.puffLimit;

    const currentPlanText =
        document.getElementById(
            "currentPlanText"
        );

    if (currentPlanText) {

        currentPlanText.textContent =
            userData.plan === "pro"
            ? "Breezy PRO"
            : "Breezy FREE";

    }

    updateDashboard();
    updateRewards();
    updatePlanAccess();
    renderAICoach();
    updateDemoModeUI();

    // Weekly/Daily/Monthly usage is a core Free feature and must
    // render on the initial refresh, not only after changing tabs.
    updateDynamicReport();

    updateAICoach();
    bindCoachButtons();

    if (typeof renderRecoveryScore === "function") {
        renderRecoveryScore();
    }
    if (typeof renderSmartGoal === "function") renderSmartGoal();
    if (typeof updateAchievements === "function") updateAchievements();

    if (typeof updateRiskMonitorCard === "function") updateRiskMonitorCard();
    if (typeof bindRiskMonitorButtons === "function") bindRiskMonitorButtons();
}


function openDeveloperMode() {

    if (!developerModal) {
        return;
    }

    // Show the modal first so optional analytics rendering
    // can never prevent the hidden developer panel from opening.
    developerModal.classList.remove(
        "hidden"
    );

    try {
        updateDemoModeUI();
    }

    catch (error) {
        console.warn(
            "Developer analytics preview could not be refreshed:",
            error
        );
    }

}


function closeDeveloperMode() {

    developerModal.classList.add(
        "hidden"
    );

}


function activateDemoMode() {

    // Only create the backup once. Regenerating demo
    // data never overwrites the user's original state.
    if (
        !userData.demoMode &&
        !userData.demoBackup
    ) {

        const backup =
            deepCloneData(userData);

        backup.demoBackup =
            null;

        backup.demoMode =
            false;

        backup.demoGeneratedAt =
            null;

        userData.demoBackup =
            backup;

    }

    userData.demoMode =
        true;

    userData.demoGeneratedAt =
        new Date().toISOString();

    userData.sessionHistory =
        generateDemoHistory();

    // Make the presentation dataset immediately useful.
    userData.plan =
        "pro";

    userData.vapeCapConnected =
        true;

    userData.points =
        Math.max(
            userData.points,
            3850
        );

    userData.totalXP =
        Math.max(
            userData.totalXP,
            1850
        );

    userData.streak =
        7;

    // Keep demo mode aligned with the current Breezy reduction architecture.
    userData.baselineSessionsPerDay = 10;
    userData.baselinePuffsPerSession = 8;
    userData.baselinePuffsPerDay = 80;
    userData.reductionGoal = 25;
    userData.challengeStage = 14;
    userData.challengeDay = 8;
    userData.currentReductionPercent = 20;
    userData.puffLimit = 64;
    userData.sessionLimit = 8;
    userData.challengeStartDate = new Date(Date.now() - (8 * 86400000)).toISOString();
    userData.lastChallengeEvaluationDate = null;
    userData.recoveryDayActive = false;
    userData.recoveryTriggeredDate = null;

    // Demo wellness activity for the new Healthy Habits and Journal features.
    const demoToday = getLocalDateKey(new Date());
    userData.healthyHabitCompletions = {
        [demoToday]: ["breathing", "workout", "lovedones"]
    };
    userData.journalEntries = [{
        date: demoToday,
        smallWins: "Stayed within my reduction target and used breathing before an evening craving.",
        feelings: "More confident because I handled the craving without immediately vaping.",
        tomorrow: "I want to keep the same routine after class and complete another healthy habit.",
        mood: "Hopeful",
        freeWrite: "The biggest difference today was delaying the first response to a craving."
    }];

    // Demo Learn completion/reflection so presentation screens are populated.
    userData.educationReflections = {
        "nicotine-cravings": {
            reflection: "I learned that cravings rise and fall, so delaying and changing what I am doing can help me avoid automatically reaching for my vape.",
            completedAt: new Date().toISOString()
        }
    };

    // Reset anti-farming records to coherent demo values.
    userData.rewardLedger = {
        dailyLoggingDates: [demoToday],
        peerEncouragementDates: [],
        celebratedAchievements: [],
        challengeMilestones: ["3-day", "7-day"],
        healthyHabits: [
            `${demoToday}:breathing`,
            `${demoToday}:workout`,
            `${demoToday}:loved-ones`
        ],
        journalDates: [demoToday],
        educationResources: ["nicotine-cravings"]
    };

    saveData();
    refreshAllUI();

    alert(
        "Developer Demo Mode activated! 🛠️\n\n" +
        "30 days of realistic college-student vaping history have been generated.\n\n" +
        "Your original data is safely backed up and can be restored from this panel."
    );

}


function restoreRealUserData() {

    if (
        !userData.demoBackup
    ) {

        alert(
            "No original data backup is available."
        );

        return;

    }

    const restoredData =
        deepCloneData(
            userData.demoBackup
        );

    userData = {
        ...userData,
        ...restoredData,
        demoMode: false,
        demoBackup: null,
        demoGeneratedAt: null
    };

    unlockedRewards =
        userData.unlockedRewards || [];

    saveData();
    refreshAllUI();

    alert(
        "Demo Mode disabled. ✓\n\n" +
        "Your original app data has been restored."
    );

}


function registerDeveloperTap() {

    developerTapCount++;

    clearTimeout(
        developerTapTimer
    );

    developerTapTimer =
        setTimeout(
            function() {
                developerTapCount = 0;
            },
            3000
        );

    if (
        developerTapCount >= 5
    ) {

        developerTapCount = 0;

        clearTimeout(
            developerTapTimer
        );

        openDeveloperMode();

    }

}


// UX-1: Profile is accessed from the Home avatar.
const profileAvatarTrigger = document.getElementById("headerAvatar");
if (profileAvatarTrigger) {
    const openProfile = function() { navigateToPage("profilePage"); };
    profileAvatarTrigger.addEventListener("click", openProfile);
    profileAvatarTrigger.addEventListener("keydown", function(event) {
        if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            openProfile();
        }
    });
}

// UX-1: The elevated center action opens the existing log-session flow.
const navLogButton = document.getElementById("navLogButton");
if (navLogButton) {
    navLogButton.addEventListener("click", function() {
        if (logModal) logModal.classList.remove("hidden");
    });
}

// UX-2.1: Learn lives under Wellness rather than primary navigation.
document.querySelectorAll(".go-to-learn").forEach(function(button) {
    button.addEventListener("click", function() {
        navigateToPage("learnPage");
    });
});

const developerTrigger =
    document.getElementById(
        "developerLogoTrigger"
    );

function bindDeveloperTrigger() {

    if (!developerTrigger) {
        return;
    }

    developerTrigger.addEventListener(
        "click",
        registerDeveloperTap
    );

    developerTrigger.addEventListener(
        "keydown",
        function(event) {

            if (
                event.key === "Enter" ||
                event.key === " "
            ) {
                event.preventDefault();
                registerDeveloperTap();
            }

        }
    );

}

bindDeveloperTrigger();


if (closeDeveloperModal) {

    closeDeveloperModal.addEventListener(
        "click",
        closeDeveloperMode
    );

}


if (generateDemoDataButton) {

    generateDemoDataButton.addEventListener(
        "click",
        activateDemoMode
    );

}


if (restoreRealDataButton) {

    restoreRealDataButton.addEventListener(
        "click",
        restoreRealUserData
    );

}


window.addEventListener(
    "click",
    function(event) {

        if (
            event.target ===
            developerModal
        ) {
            closeDeveloperMode();
        }

    }
);




// ========================================
// RECOVERY SCORE
// ========================================

function clampScore(value) {
    return Math.max(0, Math.min(100, Math.round(value)));
}

function calculateRecoveryScore() {
    const a7 = analyzeUsage(7);
    const a30 = analyzeUsage(30);

    if (!a30.totalSessions) {
        return {
            score: 0,
            rating: "Building your baseline",
            message: "Keep logging sessions to measure your progress.",
            factors: {
                goal: 0,
                reduction: 0,
                craving: 0,
                consistency: 0,
                engagement: 0
            }
        };
    }

    const goal = clampScore(a30.goalAdherence);

    // 0% reduction starts at 50; 30%+ reduction approaches 100.
    // Increased usage lowers the factor below 50.
    const reduction = clampScore(50 + (a30.reductionPercent * 1.7));

    // Lower average craving and fewer high-craving sessions improve control.
    const cravingAverageScore = 100 - ((a30.averageCraving - 1) / 9 * 100);
    const craving = clampScore(
        cravingAverageScore * 0.65 +
        (100 - a30.highCravingPercentage) * 0.35
    );

    // Consistency rewards days under goal and an active streak without
    // making streak length the sole measure of success.
    const streakContribution = Math.min(100, (a30.currentStreak / 7) * 100);
    const consistency = clampScore(
        a30.goalAdherence * 0.7 +
        streakContribution * 0.3
    );

    // Engagement uses logging density plus existing app XP.
    const loggingDays = a30.dailyCounts.filter(count => count > 0).length;
    const loggingCoverage = (loggingDays / 30) * 100;
    const xpContribution = Math.min(100, (Number(userData.totalXP) || 0) / 20);
    const engagement = clampScore(
        loggingCoverage * 0.75 +
        xpContribution * 0.25
    );

    const score = clampScore(
        goal * 0.30 +
        reduction * 0.25 +
        craving * 0.20 +
        consistency * 0.15 +
        engagement * 0.10
    );

    let rating = "Needs Attention";
    let message = "Small changes can make a meaningful difference. Focus on one manageable goal today.";

    if (score >= 85) {
        rating = "Excellent Progress";
        message = "Your recent habits show strong, consistent improvement. Keep protecting what is working.";
    } else if (score >= 70) {
        rating = "Great Progress";
        message = "You are moving in the right direction. A little more consistency can push your score even higher.";
    } else if (score >= 55) {
        rating = "Steady Progress";
        message = "Your recovery trend is developing. Focus on your highest-risk trigger and daily goal.";
    } else if (score >= 40) {
        rating = "Building Momentum";
        message = "You have a foundation to build on. Try reducing one high-risk session window this week.";
    }

    return {
        score,
        rating,
        message,
        factors: {
            goal,
            reduction,
            craving,
            consistency,
            engagement
        }
    };
}

function setRecoveryBar(id, value) {
    const element = document.getElementById(id);
    if (element) element.style.width = value + "%";
}

function renderRecoveryScore() {
    const result = calculateRecoveryScore();

    ["homeRecoveryScore", "progressRecoveryScore"].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.textContent = result.score;
    });

    ["homeRecoveryRating", "progressRecoveryRating"].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.textContent = result.rating;
    });

    ["homeRecoveryMessage", "progressRecoveryMessage"].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.textContent = result.message;
    });

    setRecoveryBar("homeRecoveryBar", result.score);

    const factorMap = {
        Goal: result.factors.goal,
        Reduction: result.factors.reduction,
        Craving: result.factors.craving,
        Consistency: result.factors.consistency,
        Engagement: result.factors.engagement
    };

    Object.entries(factorMap).forEach(([name, value]) => {
        const scoreEl = document.getElementById("recovery" + name + "Score");
        if (scoreEl) scoreEl.textContent = value + "%";
        setRecoveryBar("recovery" + name + "Bar", value);
    });

    ["homeRecoveryRing", "progressRecoveryRing"].forEach(id => {
        const ring = document.getElementById(id);
        if (ring) {
            ring.style.setProperty("--recovery-score", result.score * 3.6 + "deg");
        }
    });
}

window.BreezyRecovery = {
    calculateRecoveryScore,
    renderRecoveryScore
};


// ========================================
// AI COACH
// ========================================

let currentCoachRecommendation = {
    primaryAction: "progress",
    secondaryAction: null
};

function formatHour(hour) {
    if (hour === 0) return "12 AM";
    if (hour === 12) return "12 PM";
    return hour > 12 ? (hour - 12) + " PM" : hour + " AM";
}

function generateAICoachInsight() {
    const a7 = analyzeUsage(7);
    const a14 = analyzeUsage(14);
    const a30 = analyzeUsage(30);

    if (!a30.totalSessions) {
        return {
            title: "Start logging to meet your AI Coach.",
            text: "Log your sessions, cravings, and triggers. I’ll look for patterns and suggest practical next steps.",
            primaryLabel: "Log a Session",
            primaryAction: "log",
            secondaryLabel: null,
            secondaryAction: null,
            tone: "neutral"
        };
    }

    // High-risk patterns take priority.
    if (a7.highCravingPercentage >= 35 && a7.eveningPercentage >= 35) {
        return {
            title: "High cravings are clustering in the evening.",
            text: `${a7.highCravingPercentage}% of recent sessions had cravings of 8–10, and ${a7.eveningPercentage}% happened at night. Try a 2-minute breathing exercise before your usual evening vape window.`,
            primaryLabel: "Open SOS",
            primaryAction: "sos",
            secondaryLabel: "View Progress",
            secondaryAction: "progress",
            tone: "risk"
        };
    }

    if (a14.topTrigger && ["Stress", "Academic Pressure"].includes(a14.topTrigger.trigger) && a14.topTrigger.percentage >= 20) {
        return {
            title: `${a14.topTrigger.trigger} is your top trigger.`,
            text: `It appears in ${a14.topTrigger.percentage}% of your sessions over the last 14 days. Your peak usage is around ${formatHour(a14.peakHour)}. Consider opening Breathe or SOS before that time.`,
            primaryLabel: "Open SOS",
            primaryAction: "sos",
            secondaryLabel: "See My Patterns",
            secondaryAction: "progress",
            tone: "warning"
        };
    }

    if (a30.reductionPercent >= 10) {
        return {
            title: `Your sessions are down ${a30.reductionPercent}%. Great progress.`,
            text: `You’re averaging ${a30.averageSessionsPerDay} sessions per day with ${a30.goalAdherence}% goal adherence. Keep protecting the routines that are working.`,
            primaryLabel: "View Progress",
            primaryAction: "progress",
            secondaryLabel: null,
            secondaryAction: null,
            tone: "positive"
        };
    }

    if (a14.eveningPercentage >= 40) {
        return {
            title: "Evenings are your highest-risk window.",
            text: `${a14.eveningPercentage}% of your recent sessions happen between 6 PM and midnight. Try delaying your first evening session by 10 minutes.`,
            primaryLabel: "Open SOS",
            primaryAction: "sos",
            secondaryLabel: "View Progress",
            secondaryAction: "progress",
            tone: "warning"
        };
    }

    return {
        title: `${a30.topTrigger.trigger} is your most common recent trigger.`,
        text: `You average ${a30.averageSessionsPerDay} sessions per day and ${a30.averagePuffsPerSession} puffs per session. Keep logging so your Coach can spot stronger trends.`,
        primaryLabel: "View Progress",
        primaryAction: "progress",
        secondaryLabel: "Open SOS",
        secondaryAction: "sos",
        tone: "neutral"
    };
}

function performCoachAction(action) {
    if (action === "sos") {
        if (typeof openSOS === "function") {
            openSOS();
        } else {
            const sosModal = document.getElementById("sosModal");
            if (sosModal) sosModal.classList.remove("hidden");
        }
        return;
    }

    if (action === "log") {
        const logButton = document.getElementById("logSessionButton");
        if (logButton) logButton.click();
        return;
    }

    if (action === "home") {
        navigateToPage("home");
        return;
    }

    navigateToPage("progress");
}

function renderCoachCard(prefix, insight) {
    const title = document.getElementById(prefix + "AICoachTitle");
    const text = document.getElementById(prefix + "AICoachText");
    const card = document.getElementById(prefix + "AICoachCard");
    const primary = document.getElementById(prefix + "CoachPrimary");
    const secondary = document.getElementById(prefix + "CoachSecondary");

    if (!title || !text || !card || !primary) return;

    title.textContent = insight.title;
    text.textContent = insight.text;
    card.dataset.tone = insight.tone;

    primary.textContent = insight.primaryLabel;
    primary.dataset.action = insight.primaryAction;

    if (secondary) {
        if (insight.secondaryLabel && insight.secondaryAction) {
            secondary.textContent = insight.secondaryLabel;
            secondary.dataset.action = insight.secondaryAction;
            secondary.classList.remove("hidden");
        } else {
            secondary.classList.add("hidden");
            secondary.dataset.action = "";
        }
    }
}

function updateAICoach() {
    const insight = generateAICoachInsight();
    currentCoachRecommendation = insight;

    renderCoachCard("home", insight);
    renderCoachCard("progress", {
        ...insight,
        primaryLabel: insight.primaryAction === "progress" ? "View Today" : insight.primaryLabel,
        primaryAction: insight.primaryAction === "progress" ? "home" : insight.primaryAction
    });
}

function bindCoachButtons() {
    [
        "homeCoachPrimary",
        "homeCoachSecondary",
        "progressCoachPrimary",
        "progressCoachSecondary"
    ].forEach(id => {
        const button = document.getElementById(id);
        if (!button || button.dataset.coachBound === "true") return;

        button.dataset.coachBound = "true";
        button.addEventListener("click", function() {
            performCoachAction(this.dataset.action);
        });
    });
}




// ========================================
// PHASE 4.4 VISUAL RISK MONITOR
// ========================================

function updateRiskMonitorCard() {
    const homeTitle = document.getElementById("riskMonitorTitle");
    const homeText = document.getElementById("riskMonitorText");
    const progTitle = document.getElementById("riskMonitorProgressTitle");
    const progText = document.getElementById("riskMonitorProgressText");

    const latest = userData.sessionHistory && userData.sessionHistory.length
        ? userData.sessionHistory[userData.sessionHistory.length - 1]
        : null;

    const a7 = analyzeUsage(7);

    let title = "No immediate risk detected.";
    let text = "Your coach will flag high-craving moments after you log a session.";

    if (latest) {
        const risk = evaluateSessionRisk(latest);
        if (risk.highRisk) {
            title = "High Craving Detected ⚠️";
            text = `Craving ${risk.craving}/10 with ${risk.trigger || "a high-risk trigger"} near ${formatHour(risk.hour)}. Open SOS before the next session.`;
        } else if (a7.highCravingPercentage >= 25) {
            title = "Risk is trending upward.";
            text = `${a7.highCravingPercentage}% of recent sessions had cravings of 8–10. Try a breathing break before your usual vape window.`;
        }
    }

    if (homeTitle) homeTitle.textContent = title;
    if (homeText) homeText.textContent = text;
    if (progTitle) progTitle.textContent = title;
    if (progText) progText.textContent = text;
}

function bindRiskMonitorButtons() {
    const open = document.getElementById("riskMonitorOpen");
    const progress = document.getElementById("riskMonitorProgress");
    const progressOpen = document.getElementById("riskMonitorProgressOpen");
    const progressView = document.getElementById("riskMonitorProgressView");

    if (open && !open.dataset.bound) {
        open.dataset.bound = "1";
        open.addEventListener("click", () => showRiskPrediction(userData.sessionHistory[userData.sessionHistory.length - 1] || {}));
    }
    if (progress && !progress.dataset.bound) {
        progress.dataset.bound = "1";
        progress.addEventListener("click", () => navigateToPage("progressPage"));
    }
    if (progressOpen && !progressOpen.dataset.bound) {
        progressOpen.dataset.bound = "1";
        progressOpen.addEventListener("click", () => showRiskPrediction(userData.sessionHistory[userData.sessionHistory.length - 1] || {}));
    }
    if (progressView && !progressView.dataset.bound) {
        progressView.dataset.bound = "1";
        progressView.addEventListener("click", () => navigateToPage("homePage"));
    }
}

// ========================================
// PHASE 4.6 VISUAL ACHIEVEMENT RENDERER
// ========================================

function ensureAchievementState() {
    if (!Array.isArray(userData.achievements)) userData.achievements = [];
}

function updateAchievements() {
    ensureAchievementState();
    const a30 = analyzeUsage(30);
    let changed = false;

    achievementDefinitions.forEach(def => {
        if (def.test(a30) && !userData.achievements.includes(def.id)) {
            userData.achievements.push(def.id);
            userData.totalXP = (Number(userData.totalXP) || 0) + def.xp;
            changed = true;
        }
    });

    if (changed) saveData();
    renderAchievements();
}

function renderAchievements() {
    ensureAchievementState();
    const grid = document.getElementById("achievementGrid");
    if (!grid) return;

    grid.innerHTML = achievementDefinitions.map(def => {
        const unlocked = userData.achievements.includes(def.id);
        return `
            <div class="achievement-card ${unlocked ? "unlocked" : "locked"}">
                <div class="achievement-icon">${unlocked ? def.icon : "🔒"}</div>
                <strong>${def.title}</strong>
                <span>${unlocked ? "Unlocked" : "Locked"} · +${def.xp} XP</span>
            </div>
        `;
    }).join("");
}

window.BreezyRiskMonitor = { updateRiskMonitorCard, bindRiskMonitorButtons };
window.BreezyAchievements = { updateAchievements, renderAchievements };

// ========================================
// PHASE 4.4 — AI RISK PREDICTION
// ========================================

function evaluateSessionRisk(session) {
    const craving = Number(session.craving) || 0;
    const trigger = session.trigger || "";
    const hour = new Date(session.timestamp || Date.now()).getHours();
    let risk = 0;

    if (craving >= 8) risk += 2;
    if (craving >= 10) risk += 1;
    if (["Stress", "Academic Pressure"].includes(trigger)) risk += 2;
    if (hour >= 20 || hour <= 5) risk += 1;

    return {
        highRisk: risk >= 4,
        risk,
        craving,
        trigger,
        hour
    };
}

function showRiskPrediction(session) {
    const result = evaluateSessionRisk(session);
    if (!result.highRisk) return;

    const modal = document.getElementById("riskPredictionModal");
    const title = document.getElementById("riskPredictionTitle");
    const text = document.getElementById("riskPredictionText");
    if (!modal) return;

    title.textContent = "Pause before your next puff.";
    text.textContent =
        `You logged a craving of ${result.craving}/10 with ${result.trigger || "a high-risk trigger"}. ` +
        "Taking a short pause now may help you regain control.";
    modal.classList.remove("hidden");
}

function closeRiskPrediction() {
    const modal = document.getElementById("riskPredictionModal");
    if (modal) modal.classList.add("hidden");
}

function bindRiskPredictionUI() {
    const close = document.getElementById("closeRiskModal");
    const breathe = document.getElementById("riskBreatheButton");
    const delay = document.getElementById("riskDelayButton");
    const partner = document.getElementById("riskPartnerButton");

    if (close && !close.dataset.bound) {
        close.dataset.bound = "1";
        close.addEventListener("click", closeRiskPrediction);
    }
    if (breathe && !breathe.dataset.bound) {
        breathe.dataset.bound = "1";
        breathe.addEventListener("click", () => {
            closeRiskPrediction();
            if (typeof openSOS === "function") openSOS();
            else {
                const modal = document.getElementById("sosModal");
                if (modal) modal.classList.remove("hidden");
            }
        });
    }
    if (delay && !delay.dataset.bound) {
        delay.dataset.bound = "1";
        delay.addEventListener("click", () => {
            closeRiskPrediction();
            alert("10-minute delay started. You’ve got this. ⏱️");
        });
    }
    if (partner && !partner.dataset.bound) {
        partner.dataset.bound = "1";
        partner.addEventListener("click", () => {
            const status = document.getElementById("riskPartnerStatus");
            if (status) {
                status.textContent = "Demo notification sent to your accountability partner. ✓";
                status.classList.remove("hidden");
            }
        });
    }
}

// ========================================
// PHASE 4.5 — SMART GOAL ADJUSTMENT
// ========================================

let pendingSmartGoal = null;

function calculateSmartGoalRecommendation() {
    const a14 = analyzeUsage(14);
    if (a14.totalSessions < 10) return null;

    const current = Number(userData.sessionLimit) || 10;
    const avg = a14.averageSessionsPerDay;
    const recommended = Math.max(1, Math.floor(avg - 0.5));

    if (recommended >= current) return null;
    if (current - recommended < 1) return null;

    return { current, average: avg, recommended };
}

function renderSmartGoal() {
    const title = document.getElementById("smartGoalTitle");
    const text = document.getElementById("smartGoalText");
    const actions = document.getElementById("smartGoalActions");
    if (!title || !text || !actions) return;

    pendingSmartGoal = calculateSmartGoalRecommendation();

    if (!pendingSmartGoal) {
        title.textContent = "Your current goal looks appropriate.";
        text.textContent = "Keep logging consistently. Your Coach will suggest a new target when your recent average supports it.";
        actions.classList.add("hidden");
        return;
    }

    title.textContent = `Reduce your daily goal to ${pendingSmartGoal.recommended} sessions?`;
    text.textContent =
        `Your current limit is ${pendingSmartGoal.current}/day, while your 14-day average is ${pendingSmartGoal.average}/day. ` +
        "This smaller step may be challenging but achievable.";
    actions.classList.remove("hidden");
}

function bindSmartGoalUI() {
    const accept = document.getElementById("acceptSmartGoal");
    const dismiss = document.getElementById("dismissSmartGoal");

    if (accept && !accept.dataset.bound) {
        accept.dataset.bound = "1";
        accept.addEventListener("click", () => {
            if (!pendingSmartGoal) return;
            userData.sessionLimit = pendingSmartGoal.recommended;
            saveData();
            refreshAllUI();
            alert(`New daily goal set to ${userData.sessionLimit} sessions. 🎯`);
        });
    }

    if (dismiss && !dismiss.dataset.bound) {
        dismiss.dataset.bound = "1";
        dismiss.addEventListener("click", () => {
            const actions = document.getElementById("smartGoalActions");
            if (actions) actions.classList.add("hidden");
        });
    }
}

// ========================================
// PHASE 4.6 — ACHIEVEMENT SYSTEM
// ========================================

const achievementDefinitions = [
    { id: "first_day", icon: "🥉", title: "First Day", xp: 50,
      test: a => a.totalSessions >= 1 },
    { id: "seven_day", icon: "🥈", title: "7-Day Streak", xp: 150,
      test: a => a.currentStreak >= 7 },
    { id: "thirty_day", icon: "🥇", title: "30-Day Streak", xp: 500,
      test: a => a.currentStreak >= 30 },
    { id: "hundred_sessions", icon: "🔥", title: "100 Sessions Logged", xp: 250,
      test: a => userData.sessionHistory.length >= 100 },
    { id: "under_goal", icon: "💚", title: "First Week Under Goal", xp: 200,
      test: a => analyzeUsage(7).goalAdherence >= 100 },
    { id: "accountability", icon: "🤝", title: "Accountability Hero", xp: 100,
      test: a => Boolean(userData.accountabilityPartner) || userData.demoMode }
];

function updateAchievements() {
    const a30 = analyzeUsage(30);
    if (!Array.isArray(userData.achievements)) userData.achievements = [];

    let changed = false;

    achievementDefinitions.forEach(def => {
        if (def.test(a30) && !userData.achievements.includes(def.id)) {
            userData.achievements.push(def.id);
            userData.totalXP = (Number(userData.totalXP) || 0) + def.xp;
            changed = true;
        }
    });

    if (changed) saveData();
    renderAchievements();
}

function renderAchievements() {
    const grid = document.getElementById("achievementGrid");
    if (!grid) return;
    if (!Array.isArray(userData.achievements)) userData.achievements = [];

    grid.innerHTML = achievementDefinitions.map(def => {
        const unlocked = userData.achievements.includes(def.id);
        return `
            <div class="achievement-card ${unlocked ? "unlocked" : "locked"}">
                <div class="achievement-icon">${unlocked ? def.icon : "🔒"}</div>
                <strong>${def.title}</strong>
                <span>${unlocked ? "Unlocked" : "Locked"} · +${def.xp} XP</span>
            </div>
        `;
    }).join("");
}

window.BreezyRisk = { evaluateSessionRisk, showRiskPrediction };
window.BreezySmartGoals = { calculateSmartGoalRecommendation, renderSmartGoal };
window.BreezyAchievements = { updateAchievements, renderAchievements };

// ========================================
// INITIALIZE
// ========================================

updateUserNameUI();
updateDashboard();
renderAICoach();

updateRewards();

document.getElementById(
    "sessionLimit"
).textContent =

    userData.sessionLimit;


document.getElementById(
    "puffLimit"
).textContent =

    userData.puffLimit;


if (
    userData.plan === "pro"
) {

    document.getElementById(
        "currentPlanText"
    ).textContent =

        "Breezy PRO";

}

else {

    document.getElementById(
        "currentPlanText"
    ).textContent =

        "Breezy FREE";

}


calculateTodayUsage();

updateDashboard();

updateRewards();

updatePlanAccess();

// ========================================
// RESTORE SAVED USER
// ========================================

if (
    userData.onboardingComplete
) {

    onboarding.style.display =
        "none";

}

else {

    onboarding.style.display =
        "block";

}

// Final Phase 4.2 UI initialization
bindCoachButtons();
updateAICoach();

renderRecoveryScore();


// Phase 4.4–4.6 initialization
bindRiskPredictionUI();
bindSmartGoalUI();
renderSmartGoal();
updateAchievements();

updateRiskMonitorCard();
bindRiskMonitorButtons();
updateAchievements();
renderAchievements();


// Sub-phases 3 & 4: evaluate the previous completed day once per app load.
document.addEventListener("DOMContentLoaded", function() {
    evaluatePendingChallengeDay();
    updateDashboard();
    updateRecoveryDayUI();
});

// ========================================
// SUB-PHASE 5: HEALTHY HABIT TRACKER
// ========================================
const HEALTHY_HABITS = [
    { id: "workout", icon: "🏃", title: "10-minute workout", description: "Move your body for at least 10 minutes." },
    { id: "breathing", icon: "🫁", title: "5-minute meditation or breathing", description: "Take five minutes to slow down and reset." },
    { id: "steps", icon: "👟", title: "Achieve 3,000 steps", description: "Reach at least 3,000 steps today." },
    { id: "friends", icon: "🤝", title: "Fun activity with friends", description: "Spend social time together without vaping." },
    { id: "emotions", icon: "✍️", title: "Journal your emotions", description: "Write down what you are feeling and what triggered it." },
    { id: "lovedones", icon: "💛", title: "Spend time with loved ones", description: "Make time for supportive people in your life." }
];

function getTodayHabitCompletions() {
    const key = getLocalDateKey(new Date());
    if (!Array.isArray(userData.healthyHabitCompletions[key])) userData.healthyHabitCompletions[key] = [];
    return userData.healthyHabitCompletions[key];
}

function completeHealthyHabit(habitId) {
    const today = getLocalDateKey(new Date());
    const completed = getTodayHabitCompletions();
    if (completed.includes(habitId)) return;
    completed.push(habitId);
    const rewardKey = today + ":" + habitId;
    let earned = 0;
    if (!userData.rewardLedger.healthyHabits.includes(rewardKey)) {
        userData.rewardLedger.healthyHabits.push(rewardKey);
        earned = awardPoints(15);
    }
    saveData();
    renderHealthyHabits();
    const msg = document.getElementById("habitRewardMessage");
    if (msg) msg.textContent = earned ? `Habit completed! +${earned} BreezyPoints.` : "Habit completed for today.";
}

function renderHealthyHabits() {
    const list = document.getElementById("habitList");
    if (!list) return;
    const completed = getTodayHabitCompletions();
    list.innerHTML = HEALTHY_HABITS.map(h => {
        const done = completed.includes(h.id);
        return `<button type="button" class="habit-item ${done ? "completed" : ""}" data-habit-id="${h.id}" ${done ? "disabled" : ""}><span class="habit-icon">${h.icon}</span><span class="habit-copy"><strong>${h.title}</strong><small>${h.description}</small></span><span class="habit-action">${done ? "✓ Done" : "+15 pts"}</span></button>`;
    }).join("");
    list.querySelectorAll("[data-habit-id]").forEach(btn => btn.addEventListener("click", () => completeHealthyHabit(btn.dataset.habitId)));
    const count = completed.length;
    const text = document.getElementById("habitProgressText");
    const fill = document.getElementById("habitProgressFill");
    if (text) text.textContent = `${count} of ${HEALTHY_HABITS.length}`;
    if (fill) fill.style.width = `${Math.round(count / HEALTHY_HABITS.length * 100)}%`;
}

// ========================================
// SUB-PHASE 6: CESSATION JOURNEY JOURNAL
// ========================================
function getTodayJournalEntry() {
    const today = getLocalDateKey(new Date());
    return userData.journalEntries.find(entry => entry.date === today) || null;
}

function renderJournal() {
    const form = document.getElementById("journalForm");
    if (!form) return;
    const todayEntry = getTodayJournalEntry();
    const fields = {
        journalWins: todayEntry?.wins || "", journalFeelings: todayEntry?.feelings || "", journalTomorrow: todayEntry?.tomorrow || "",
        journalMood: todayEntry?.mood || "", journalFreeWrite: todayEntry?.freeWrite || ""
    };
    Object.entries(fields).forEach(([id,value]) => { const el=document.getElementById(id); if(el) el.value=value; });
    const status = document.getElementById("journalStatus");
    if (status) status.textContent = todayEntry ? "Today's entry is saved. You can update it without earning duplicate points." : "";
    renderJournalHistory();
}

function renderJournalHistory() {
    const history = document.getElementById("journalHistory");
    const count = document.getElementById("journalEntryCount");
    if (!history) return;
    const entries = [...userData.journalEntries].sort((a,b) => b.date.localeCompare(a.date));
    if (count) count.textContent = `${entries.length} ${entries.length === 1 ? "entry" : "entries"}`;
    if (!entries.length) { history.innerHTML = '<div class="journal-empty">Your saved reflections will appear here.</div>'; return; }
    history.innerHTML = entries.map(entry => `<article class="journal-history-item"><div class="journal-history-top"><strong>${entry.date}</strong>${entry.mood ? `<span>${entry.mood}</span>` : ""}</div><p><b>Small win:</b> ${escapeWellnessHTML(entry.wins)}</p><p><b>How it felt:</b> ${escapeWellnessHTML(entry.feelings)}</p><p><b>Tomorrow:</b> ${escapeWellnessHTML(entry.tomorrow)}</p>${entry.freeWrite ? `<p class="journal-freewrite">${escapeWellnessHTML(entry.freeWrite)}</p>` : ""}</article>`).join("");
}

function escapeWellnessHTML(value) {
    return String(value || "").replace(/[&<>\"']/g, ch => ({"&":"&amp;","<":"&lt;",">":"&gt;",'\"':"&quot;","'":"&#039;"}[ch]));
}

const journalForm = document.getElementById("journalForm");
if (journalForm) journalForm.addEventListener("submit", event => {
    event.preventDefault();
    const wins = document.getElementById("journalWins").value.trim();
    const feelings = document.getElementById("journalFeelings").value.trim();
    const tomorrow = document.getElementById("journalTomorrow").value.trim();
    if (!wins || !feelings || !tomorrow) return;
    const date = getLocalDateKey(new Date());
    const entry = { date, wins, feelings, tomorrow, mood: document.getElementById("journalMood").value, freeWrite: document.getElementById("journalFreeWrite").value.trim(), updatedAt: new Date().toISOString() };
    const existingIndex = userData.journalEntries.findIndex(item => item.date === date);
    if (existingIndex >= 0) userData.journalEntries[existingIndex] = entry; else userData.journalEntries.push(entry);
    let earned = 0;
    if (!userData.rewardLedger.journalDates.includes(date)) { userData.rewardLedger.journalDates.push(date); earned = awardPoints(20); }
    saveData();
    renderJournal();
    const status = document.getElementById("journalStatus");
    if (status) status.textContent = earned ? `Journal saved! +${earned} BreezyPoints.` : "Today's journal was updated. Your daily journal reward was already earned.";
});

renderHealthyHabits();
renderJournal();


// ========================================
// SUB-PHASE 7 — LEARN & EDUCATIONAL CONTENT
// ========================================
const LEARN_RESOURCES = [
  { id:"vaping-myths", type:"Article", icon:"🧠", title:"Vaping myths vs. facts", summary:"Separate common misconceptions from what is known about vaping and nicotine use.", body:`<p>Vaping is sometimes described as harmless because there is no burning tobacco. That does not mean the aerosol is simply water vapor or that nicotine exposure is risk-free.</p><p>A useful reduction mindset is to avoid all-or-nothing thinking: reducing use can be a practical step while you build skills, recognize triggers, and work toward your longer-term goal.</p><h3>Try this</h3><p>Notice one belief that makes it easier to vape automatically. Replace it with a more accurate reminder that supports your reduction plan.</p>` },
  { id:"nicotine-cravings", type:"Video lesson", icon:"🎥", title:"Understanding cravings", summary:"Learn why cravings rise and fall and how delaying a response can weaken automatic habits.", body:`<div class="lesson-video-placeholder"><span>▶</span><strong>3-minute Breezy lesson</strong><small>Prototype educational video</small></div><p>Cravings can be triggered by routines, emotions, places, people, or nicotine withdrawal. They often change in intensity instead of staying at their peak continuously.</p><p>Creating a short delay gives you time to choose a response instead of immediately following the usual cue → vape pattern.</p><h3>Try this</h3><p>When a craving appears, delay for five minutes and pair the delay with breathing, water, movement, or another healthy habit.</p>` },
  { id:"benefits-reducing", type:"Article", icon:"🌱", title:"Why gradual reduction can help", summary:"See how smaller, consistent targets can make behavior change more manageable.", body:`<p>A gradual reduction plan turns a large goal into smaller daily decisions. Breezy uses your baseline and challenge stages so that the target can become progressively more demanding without forcing the full reduction goal on day one.</p><p>Consistency is more useful than chasing a perfect day. If a difficult day happens, returning to the plan matters.</p><h3>Try this</h3><p>Focus on today's Daily Reduction Target rather than the entire journey at once.</p>` },
  { id:"healthier-coping", type:"Video lesson", icon:"🎥", title:"Build healthier coping responses", summary:"Match common triggers such as stress, boredom, and peer pressure with alternative actions.", body:`<div class="lesson-video-placeholder"><span>▶</span><strong>4-minute Breezy lesson</strong><small>Prototype educational video</small></div><p>Different triggers benefit from different responses. Stress may respond to breathing, movement, or journaling. Boredom may respond to a hobby or activity. Social triggers may be easier when you plan a non-vaping activity with friends.</p><p>The goal is not merely to resist a craving; it is to build another response that can become easier to choose over time.</p>` }
];
let activeLearnResourceId = null;

function renderLearnResources(){
  const list=document.getElementById("learnResourceList"); if(!list) return;
  const completed=userData.rewardLedger.educationResources || [];
  list.innerHTML=LEARN_RESOURCES.map(r=>{const done=completed.includes(r.id); return `<article class="learn-resource-card ${done?'completed':''}"><div class="learn-resource-icon">${r.icon}</div><div class="learn-resource-copy"><span class="eyebrow">${r.type.toUpperCase()}</span><h3>${r.title}</h3><p>${r.summary}</p></div><button type="button" class="small-button learn-open-button" data-learn-id="${r.id}">${done?'Review':'Open lesson'}</button>${done?'<span class="learn-complete-badge">✓ Completed</span>':''}</article>`}).join("");
  list.querySelectorAll("[data-learn-id]").forEach(b=>b.addEventListener("click",()=>openLearnResource(b.dataset.learnId)));
  const count=document.getElementById("learnCompletionCount"); if(count) count.textContent=`${completed.length} of ${LEARN_RESOURCES.length} completed`;
}
function openLearnResource(id){
  const r=LEARN_RESOURCES.find(x=>x.id===id); if(!r) return; activeLearnResourceId=id;
  document.getElementById("learnReaderType").textContent=r.type.toUpperCase(); document.getElementById("learnReaderTitle").textContent=r.title; document.getElementById("learnReaderBody").innerHTML=r.body;
  const reflection=userData.educationReflections[id]?.reflection || ""; const ta=document.getElementById("learnReflection"); ta.value=reflection; updateLearnReflectionCount();
  const completed=userData.rewardLedger.educationResources.includes(id); const btn=document.getElementById("submitLearnReflection"); btn.textContent=completed?"Update reflection":"Complete lesson & submit reflection";
  document.getElementById("learnReflectionStatus").textContent=completed?"You've already earned the reward for this lesson. You can still update your reflection.":"";
  const section=document.getElementById("learnReaderSection"); section.classList.remove("hidden"); section.scrollIntoView({behavior:"smooth",block:"start"});
}
function updateLearnReflectionCount(){const ta=document.getElementById("learnReflection"), c=document.getElementById("learnReflectionCount"); if(ta&&c)c.textContent=`${ta.value.trim().length} / 40 minimum`;}
const learnReflection=document.getElementById("learnReflection"); if(learnReflection) learnReflection.addEventListener("input",updateLearnReflectionCount);
const closeLearnReader=document.getElementById("closeLearnReader"); if(closeLearnReader) closeLearnReader.addEventListener("click",()=>document.getElementById("learnReaderSection").classList.add("hidden"));
const submitLearnReflection=document.getElementById("submitLearnReflection"); if(submitLearnReflection) submitLearnReflection.addEventListener("click",()=>{
  if(!activeLearnResourceId)return; const text=document.getElementById("learnReflection").value.trim(), status=document.getElementById("learnReflectionStatus");
  if(text.length<40){status.textContent="Please write at least 40 characters so your reflection captures what you learned."; return;}
  userData.educationReflections[activeLearnResourceId]={reflection:text,updatedAt:new Date().toISOString()}; let earned=0;
  if(!userData.rewardLedger.educationResources.includes(activeLearnResourceId)){userData.rewardLedger.educationResources.push(activeLearnResourceId); earned=awardPoints(20);}
  saveData(); status.textContent=earned?`Lesson completed! +${earned} BreezyPoints.`:"Reflection updated. This lesson's reward was already earned."; renderLearnResources(); submitLearnReflection.textContent="Update reflection";
});
renderLearnResources();

// ========================================
// UX-2 HOME SHORTCUTS
// ========================================
document.querySelectorAll("[data-page-target]").forEach(function(button) {
    if (button.dataset.pageTargetBound === "true") return;
    button.dataset.pageTargetBound = "true";
    button.addEventListener("click", function() {
        const target = button.dataset.pageTarget;
        if (target) navigateToPage(target);
    });
});


// ========================================
// UX-4: WELLNESS HUB + QUICK BOTTOM SHEETS
// ========================================
function ux4OpenWellnessSheet(sourceId, eyebrow, title) {
    const source = document.getElementById(sourceId);
    if (!source || typeof openBottomSheet !== "function") return;
    // openBottomSheet accepts HTML in the UX-3.5 architecture.
    openBottomSheet({ eyebrow, title, html: source.innerHTML });
    // Move the live nodes into the sheet instead of duplicating IDs.
    const body = document.getElementById("bottomSheetBody");
    if (body) {
        body.innerHTML = "";
        while (source.firstChild) body.appendChild(source.firstChild);
        body.dataset.ux4Source = sourceId;
    }
}

function ux4RestoreWellnessSheetSource() {
    const body = document.getElementById("bottomSheetBody");
    if (!body || !body.dataset.ux4Source) return;
    const source = document.getElementById(body.dataset.ux4Source);
    if (source) {
        while (body.firstChild) source.appendChild(body.firstChild);
    }
    delete body.dataset.ux4Source;
}

const ux4OriginalCloseBottomSheet = typeof closeBottomSheet === "function" ? closeBottomSheet : null;
if (ux4OriginalCloseBottomSheet) {
    closeBottomSheet = function() {
        ux4RestoreWellnessSheetSource();
        return ux4OriginalCloseBottomSheet();
    };
}

const openHabitsSheet = document.getElementById("openHabitsSheet");
if (openHabitsSheet) openHabitsSheet.addEventListener("click", function() {
    ux4OpenWellnessSheet("ux4HabitsSource", "TODAY", "Healthy Habits");
});

const openJournalSheet = document.getElementById("openJournalSheet");
if (openJournalSheet) openJournalSheet.addEventListener("click", function() {
    ux4OpenWellnessSheet("ux4JournalSource", "REFLECT", "Daily Journal");
});

const openJournalHistorySheet = document.getElementById("openJournalHistorySheet");
if (openJournalHistorySheet) openJournalHistorySheet.addEventListener("click", function() {
    renderJournalHistory();
    ux4OpenWellnessSheet("ux4JournalHistorySource", "YOUR JOURNEY", "Journal History");
});

function updateUX4WellnessSummary() {
    const completed = typeof getTodayHabitCompletions === "function" ? getTodayHabitCompletions() : [];
    const count = completed.length;
    const total = typeof HEALTHY_HABITS !== "undefined" ? HEALTHY_HABITS.length : 6;
    const text = document.getElementById("ux4HabitProgressText");
    const fill = document.getElementById("ux4HabitProgressFill");
    if (text) text.textContent = `${count}/${total}`;
    if (fill) fill.style.width = `${Math.round((count / total) * 100)}%`;

    const todayEntry = typeof getTodayJournalEntry === "function" ? getTodayJournalEntry() : null;
    const status = document.getElementById("ux4JournalStatus");
    const summary = document.getElementById("ux4JournalSummary");
    if (status) {
        status.textContent = todayEntry ? "Done" : "Not yet";
        status.classList.toggle("done", !!todayEntry);
    }
    if (summary) summary.textContent = todayEntry
        ? "Today's reflection is saved. You can update it anytime."
        : "Capture today's wins and how you're feeling.";
}

document.addEventListener("click", function(event) {
    if (event.target.closest("[data-habit-id]")) setTimeout(updateUX4WellnessSummary, 0);
});
if (journalForm) journalForm.addEventListener("submit", function() {
    setTimeout(updateUX4WellnessSummary, 0);
});
updateUX4WellnessSummary();


/* ========================================
   UX-6 — INTERACTION CONSISTENCY
========================================= */
function syncSupportOnlyActions() {
    const supportPage = document.getElementById("peersPage");
    const circleBtn = document.querySelector(".support-only-circle");
    if (!circleBtn || !supportPage) return;
    const isSupportVisible =
        supportPage.classList.contains("active-page") ||
        getComputedStyle(supportPage).display !== "none";
    circleBtn.classList.toggle("is-visible", isSupportVisible);
}

function ux6PressFeedback(target) {
    if (!target) return;
    target.classList.add("ux6-pressed");
    window.setTimeout(() => target.classList.remove("ux6-pressed"), 150);
}

document.addEventListener("click", function (event) {
    const interactive = event.target.closest("button, .nav-item, .learn-resource-card, .ux4-wellness-action, .support-action-card, .activity-card");
    if (interactive) ux6PressFeedback(interactive);
    window.setTimeout(syncSupportOnlyActions, 30);
});

document.addEventListener("DOMContentLoaded", function () {
    syncSupportOnlyActions();

    // Improve accessibility/interaction semantics for tappable cards.
    document.querySelectorAll(".learn-resource-card, .ux4-wellness-action, .support-action-card").forEach(card => {
        if (!card.hasAttribute("tabindex")) card.setAttribute("tabindex", "0");
    });
});

window.addEventListener("hashchange", syncSupportOnlyActions);


/* ========================================
   FREE PLAN — ADVANCED COACHING PREVIEW
========================================= */
function updateAdvancedCoachingPreview() {
    const isFree = !userData || userData.plan !== "pro";
    const candidates = Array.from(document.querySelectorAll(
        ".card, .coach-card, .ai-coach-card, .advanced-coaching-card, section"
    ));
    const coachingCard = candidates.find(el => {
        const text = (el.textContent || "").toLowerCase();
        return text.includes("advanced coaching");
    });
    if (!coachingCard) return;

    coachingCard.classList.toggle("free-coaching-preview", isFree);
    coachingCard.setAttribute("aria-disabled", isFree ? "true" : "false");

    if (isFree) {
        coachingCard.querySelectorAll("button, a, input, select, textarea").forEach(el => {
            el.setAttribute("tabindex", "-1");
            el.setAttribute("aria-disabled", "true");
        });
        if (!coachingCard.querySelector(".free-coaching-lock")) {
            const lock = document.createElement("div");
            lock.className = "free-coaching-lock";
            lock.innerHTML = `<div class="free-coaching-lock-pill">🔒 PRO</div><strong>Unlock Advanced Coaching</strong><span>Upgrade to Breezy PRO for personalized coaching insights.</span>`;
            coachingCard.appendChild(lock);
        }
    } else {
        coachingCard.querySelector(".free-coaching-lock")?.remove();
        coachingCard.querySelectorAll("[aria-disabled='true']").forEach(el => {
            el.removeAttribute("aria-disabled");
            if (el.getAttribute("tabindex") === "-1") el.removeAttribute("tabindex");
        });
    }
}

document.addEventListener("DOMContentLoaded", updateAdvancedCoachingPreview);
document.addEventListener("click", function(e) {
    const locked = e.target.closest(".free-coaching-preview");
    if (locked) {
        e.preventDefault();
        e.stopPropagation();

        // Reuse Breezy's existing PRO upgrade experience.
        if (typeof openProModal === "function") {
            openProModal();
        } else if (typeof openUpgradeModal === "function") {
            openUpgradeModal();
        } else if (typeof showProModal === "function") {
            showProModal();
        } else {
            const proTrigger = document.querySelector(
                "[data-open-pro], [data-pro-modal], .pro-upgrade-button, .breezy-pro-card button"
            );
            if (proTrigger) proTrigger.click();
        }
    }
}, true);

/* UX-8 — Rewards access */
function getUX8PointsBalance(){
 const c=[userData?.breezyPoints,userData?.points,userData?.rewardPoints,userData?.rewards?.points];
 return c.find(v=>typeof v==="number"&&Number.isFinite(v))||0;
}
function updateUX8RewardsEntry(){
 const b=getUX8PointsBalance();
 document.querySelectorAll("[data-ux8-points]").forEach(el=>el.textContent=b.toLocaleString());
}
document.addEventListener("DOMContentLoaded",updateUX8RewardsEntry);
document.addEventListener("click",()=>setTimeout(updateUX8RewardsEntry,50));

/* UX-8 — Reward catalog redemption states */
function updateUX8RewardCatalog(){
  const balance = typeof getUX8PointsBalance === "function" ? getUX8PointsBalance() : 0;
  document.querySelectorAll(".ux8-reward-card").forEach(card=>{
    const cost = Number(card.dataset.rewardCost || 0);
    const btn = card.querySelector(".ux8-redeem-btn");
    const canRedeem = balance >= cost;
    card.classList.toggle("can-redeem", canRedeem);
    card.classList.toggle("not-enough-points", !canRedeem);
    if(btn){
      btn.textContent = canRedeem ? "Redeem" : `${Math.max(0,cost-balance).toLocaleString()} more`;
      btn.setAttribute("aria-disabled", canRedeem ? "false" : "true");
    }
  });
}
document.addEventListener("DOMContentLoaded", updateUX8RewardCatalog);
document.addEventListener("click", function(e){
  const btn=e.target.closest("[data-redeem-reward]");
  if(!btn) return;
  const cost=Number(btn.dataset.cost||0);
  const balance=typeof getUX8PointsBalance==="function"?getUX8PointsBalance():0;
  if(balance<cost){
    if(typeof showToast==="function") showToast(`You need ${(cost-balance).toLocaleString()} more BreezyPoints.`);
    return;
  }
  if(typeof showToast==="function") showToast(`${btn.dataset.redeemReward} selected for redemption.`);
});
document.addEventListener("click",()=>setTimeout(updateUX8RewardCatalog,60));

/* UX-8.1 — Reward catalog filters */
document.addEventListener("click", function(e){
  const chip = e.target.closest("[data-reward-filter]");
  if(!chip) return;
  const filter = chip.dataset.rewardFilter;
  document.querySelectorAll("[data-reward-filter]").forEach(c=>c.classList.toggle("active", c===chip));
  document.querySelectorAll("[data-reward-category]").forEach(group=>{
    group.classList.toggle("ux8-filter-hidden", filter!=="all" && group.dataset.rewardCategory!==filter);
  });
});


/* UX-8 — Rewards popups and real-world rewards cleanup */
function getUX8PointsBalance(){
  const c=[userData?.breezyPoints,userData?.points,userData?.rewardPoints,userData?.rewards?.points];
  return c.find(v=>typeof v==="number"&&Number.isFinite(v))||0;
}
function updateUX8RewardsEntry(){
  const b=getUX8PointsBalance();
  document.querySelectorAll("[data-ux8-points]").forEach(el=>el.textContent=b.toLocaleString());
  updateUX8RewardCatalog?.();
}
function updateUX8RewardCatalog(){
  const balance = getUX8PointsBalance();
  document.querySelectorAll(".ux8-reward-card").forEach(card=>{
    const cost = Number(card.dataset.rewardCost || 0);
    const btn = card.querySelector(".ux8-redeem-btn");
    const canRedeem = balance >= cost;
    card.classList.toggle("can-redeem", canRedeem);
    card.classList.toggle("not-enough-points", !canRedeem);
    if(btn){
      btn.textContent = canRedeem ? "Redeem" : `${Math.max(0,cost-balance).toLocaleString()} more`;
      btn.setAttribute("aria-disabled", canRedeem ? "false" : "true");
    }
  });
}
function openUX8Popup(kind){
  const backdrop = document.getElementById("ux8PopupBackdrop");
  const eyebrow = document.getElementById("ux8PopupEyebrow");
  const title = document.getElementById("ux8PopupTitle");
  const body = document.getElementById("ux8PopupBody");
  if(!backdrop || !eyebrow || !title || !body) return;

  const content = {
    earn: {
      eyebrow: "HOW YOU EARN POINTS",
      title: "Earn BreezyPoints",
      body: `
        <div class="ux8-popup-stack">
          <div class="ux8-popup-row"><strong>Healthy actions</strong><span>Reduce usage, complete support actions, and stay engaged with the app.</span></div>
          <div class="ux8-popup-row"><strong>Learning</strong><span>Finish lessons and submit reflections to earn points.</span></div>
          <div class="ux8-popup-row"><strong>Consistency</strong><span>Build streaks and check in regularly to keep earning.</span></div>
        </div>`
    },
    badges: {
      eyebrow: "YOUR BADGES",
      title: "Badges and milestones",
      body: `
        <div class="ux8-popup-stack">
          <div class="ux8-badge-grid">
            <div class="ux8-badge-pill">🌱 First Steps</div>
            <div class="ux8-badge-pill">🔥 3-Day Streak</div>
            <div class="ux8-badge-pill">🏅 Lesson Complete</div>
            <div class="ux8-badge-pill">🤝 Support Buddy</div>
          </div>
          <p class="ux8-popup-note">Badges help users feel progress without overwhelming the main experience.</p>
        </div>`
    },
    achievements: {
      eyebrow: "ACHIEVEMENTS 🏆",
      title: "Celebrate progress",
      body: `
        <div class="ux8-popup-stack">
          <div class="ux8-popup-row"><strong>Milestone tracking</strong><span>See streaks, reductions, and completed habits at a glance.</span></div>
          <div class="ux8-popup-row"><strong>Unlocked moments</strong><span>Celebrate meaningful wins as users move through the journey.</span></div>
          <div class="ux8-popup-row"><strong>Next target</strong><span>Always show the next achievable goal to keep motivation clear.</span></div>
        </div>`
    }
  }[kind];

  if(!content) return;
  eyebrow.textContent = content.eyebrow;
  title.textContent = content.title;
  body.innerHTML = content.body;
  backdrop.classList.remove("hidden");
  backdrop.setAttribute("aria-hidden", "false");
}

function closeUX8Popup(){
  const backdrop = document.getElementById("ux8PopupBackdrop");
  if(!backdrop) return;
  backdrop.classList.add("hidden");
  backdrop.setAttribute("aria-hidden", "true");
}

document.addEventListener("click", function(e){
  const trigger = e.target.closest("[data-ux8-popup]");
  if(trigger){
    openUX8Popup(trigger.dataset.ux8Popup);
  }
  if(e.target.closest("[data-ux8-popup-close]") || e.target.id === "ux8PopupBackdrop"){
    closeUX8Popup();
  }
  const btn=e.target.closest("[data-redeem-reward]");
  if(btn){
    const cost=Number(btn.dataset.cost||0);
    const balance=getUX8PointsBalance();
    if(balance<cost){
      if(typeof showToast==="function") showToast(`You need ${(cost-balance).toLocaleString()} more BreezyPoints.`);
      return;
    }
    if(typeof showToast==="function") showToast(`${btn.dataset.redeemReward} selected for redemption.`);
  }
  setTimeout(updateUX8RewardsEntry,60);
}, true);

document.addEventListener("DOMContentLoaded", function(){
  updateUX8RewardsEntry();
  updateUX8RewardCatalog();
});
document.addEventListener("keydown", function(e){
  if(e.key === "Escape") closeUX8Popup();
});
