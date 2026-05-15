const DAILY_LIMIT = 3

/*
====================================
GET TODAY DATE
====================================
*/

function getTodayDate() {

  return new Date().toLocaleDateString()

}

/*
====================================
GET SAVED USAGE
====================================
*/

function getUsageData() {

  const savedData =
    localStorage.getItem("cg_usage")

  if (!savedData) {

    return {
      date: getTodayDate(),
      count: 0
    }

  }

  return JSON.parse(savedData)

}

/*
====================================
UPDATE USAGE
====================================
*/

function updateUsage() {

  let usage = getUsageData()

  /*
  RESET NEXT DAY
  */

  if (usage.date !== getTodayDate()) {

    usage = {
      date: getTodayDate(),
      count: 0
    }

  }

  usage.count += 1

  localStorage.setItem(
    "cg_usage",
    JSON.stringify(usage)
  )

}

/*
====================================
CHECK LIMIT
====================================
*/

function canUseTool() {

  let usage = getUsageData()

  /*
  RESET NEXT DAY
  */

  if (usage.date !== getTodayDate()) {

    usage = {
      date: getTodayDate(),
      count: 0
    }

    localStorage.setItem(
      "cg_usage",
      JSON.stringify(usage)
    )

  }

  return usage.count < DAILY_LIMIT

}

/*
====================================
BUTTONS
====================================
*/

const humanizeBtn =
  document.getElementById("humanizeBtn")

const copyBtn =
  document.getElementById("copyBtn")

/*
====================================
HUMANIZE BUTTON
====================================
*/

humanizeBtn.addEventListener(
  "click",
  async () => {

    const inputText =
      document.getElementById("inputText").value

    const tone =
      document.getElementById("tone").value

    const outputText =
      document.getElementById("outputText")

    /*
    ====================================
    FREE LIMIT CHECK
    ====================================
    */

    if (!canUseTool()) {

      alert(
        "Free daily limit reached. Upgrade to Pro for unlimited access."
      )

      return

    }

    /*
    ====================================
    EMPTY INPUT CHECK
    ====================================
    */

    if (!inputText.trim()) {

      alert(
        "Please paste content first"
      )

      return

    }

    /*
    ====================================
    LOADING STATE
    ====================================
    */

    outputText.value =
      "Humanizing content..."

    try {

      /*
      ====================================
      API REQUEST
      ====================================
      */

      const response = await fetch(
        "http://localhost:5000/humanize",
        {

          method: "POST",

          headers: {
            "Content-Type":
              "application/json"
          },

          body: JSON.stringify({
            content: inputText,
            tone: tone
          })

        }
      )

      /*
      ====================================
      CONVERT RESPONSE
      ====================================
      */

      const data =
        await response.json()

      console.log(data)

      /*
      ====================================
      SUCCESS
      ====================================
      */

      if (data.success) {

        updateUsage()

        outputText.value =
          data.result ||
          "No content generated"

      }

      /*
      ====================================
      ERROR
      ====================================
      */

      else {

        outputText.value =
          data.error ||
          "Something went wrong"

      }

    }

    catch (error) {

      console.log(error)

      outputText.value =
        "Server error. Please try again."

    }

  }
)

/*
====================================
COPY BUTTON
====================================
*/

copyBtn.addEventListener(
  "click",
  () => {

    const outputText =
      document.getElementById(
        "outputText"
      )

    if (!outputText.value.trim()) {

      alert("No content to copy")

      return

    }

    navigator.clipboard.writeText(
      outputText.value
    )

    alert("Copied Successfully!")

  }
)