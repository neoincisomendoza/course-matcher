import path from 'path'
import dotenv from 'dotenv'

const ENV_PATH = path.resolve(process.cwd(), '.env')
dotenv.config({ path: ENV_PATH })

import cors from 'cors'
import express from 'express'
import helmet from 'helmet'

export const app = express()
app.use(cors())
app.use(helmet())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// TODO

app.listen(process.env.PORT, () => {
    console.log(`Server is running on port ${process.env.PORT}`)
})
