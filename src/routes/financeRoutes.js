import { Router } from "express";
import { deleteEntry, editEntry, getEntries, newEntry } from "../controller/finance.js";
import { authValidation } from "../middleware/Auth.validate.js";

const financeRouter = Router();

financeRouter.use(authValidation)
financeRouter.post("/new-entry", newEntry)
financeRouter.get("/entries", getEntries)
financeRouter.delete("/entries/:id", deleteEntry)
financeRouter.put("/entries/:id", editEntry)

export default financeRouter;
