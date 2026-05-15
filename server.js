import express from "express"
import cors from "cors"
import dotenv from "dotenv"
import OpenAI from "openai"
import Cashfree from "cashfree-pg"

dotenv.config()

const app = express()

app.use(cors())

app.use(express.json({
  limit: "2mb"
}))

/*
====================================
OPENAI SETUP
====================================
*/

const openai = new OpenAI({
  apiKey:
    process.env.OPENAI_API_KEY
})

/*
====================================
CASHFREE SETUP
====================================
*/

Cashfree.XClientId =
  process.env.CASHFREE_APP_ID

Cashfree.XClientSecret =
  process.env.CASHFREE_SECRET_KEY

Cashfree.XEnvironment =
  "SANDBOX"

/*
====================================
HOME ROUTE
====================================
*/

app.get("/", (req, res) => {

  res.json({
    status:
      "CaptionGenz API Running"
  })

})

/*
====================================
HUMANIZER ROUTE
====================================
*/

app.post(
  "/humanize",
  async (req, res) => {

    try {

      const {
        content,
        tone
      } = req.body

      /*
      ============================
      VALIDATION
      ============================
      */

      if (
        !content ||
        content.trim() === ""
      ) {

        return res.status(400).json({
          success: false,
          error:
            "Content is required"
        })

      }

      /*
      ============================
      FREE WORD LIMIT
      ============================
      */

      const wordCount =
        content
          .trim()
          .split(/\s+/).length

      if (wordCount > 1000) {

        return res.status(400).json({
          success: false,
          error:
            "Free plan supports maximum 1000 words"
        })

      }

      /*
      ============================
      ADVANCED HUMANIZER PROMPT
      ============================
      */

      const prompt = `
You are a professional human editor and SEO writer.

Rewrite the article naturally.

IMPORTANT RULES:

- Human sounding
- SEO friendly
- Conversational
- Engaging
- Natural sentence rhythm
- Remove robotic AI patterns
- Preserve meaning
- Mix short and long sentences
- Avoid repetitive phrasing
- Tone: ${tone}

Return ONLY the rewritten article.

Article:
${content}
`

      /*
      ============================
      OPENAI REQUEST
      ============================
      */

      const response =
        await openai.responses.create({

          model: "gpt-5-mini",

          input: prompt

        })

      const result =
        response.output_text

      /*
      ============================
      FINAL RESPONSE
      ============================
      */

      res.json({

        success: true,

        words: wordCount,

        result

      })

    }

    catch (error) {

      console.log(error)

      res.status(500).json({

        success: false,

        error:
          "Something went wrong"

      })

    }

  }
)

/*
====================================
CREATE PAYMENT ORDER
====================================
*/

app.post(
  "/create-order",
  async (req, res) => {

    try {

      const request = {

        order_amount: 199,

        order_currency: "INR",

        customer_details: {

          customer_id:
            "user_" + Date.now(),

          customer_phone:
            "9999999999"

        },

        order_meta: {

          return_url:
            "http://localhost:5500"

        }

      }

      const response =
        await Cashfree.PGCreateOrder(
          "2023-08-01",
          request
        )

      res.json(response.data)

    }

    catch (error) {

      console.log(error)

      res.status(500).json({

        success: false,

        error:
          "Payment order failed"

      })

    }

  }
)

/*
====================================
START SERVER
====================================
*/

const PORT =
process.env.PORT || 5000

app.listen(PORT, "0.0.0.0", () => {

  console.log(
    `Server Running On Port ${PORT}`
  )

})