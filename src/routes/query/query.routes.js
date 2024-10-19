import express from "express";
import * as queryCtrl from "../../controllers/query/query.controller.js";
import verifyToken from "../../middlewares/authMiddleware.js";
const router = express.Router();

router.route("/ticket")
    .post(verifyToken, queryCtrl.createNewQueryTicket)
    .get(verifyToken, queryCtrl.getCompanyTickets)
    .delete(verifyToken, queryCtrl.deleteTicket);

router.post("/further", verifyToken, queryCtrl.futherQueryToTicket);
router.post("/response", verifyToken, queryCtrl.respondToTicket);
router.get("/ticket-chat", verifyToken, queryCtrl.getTicketChat);
router.get("/ticket-all", verifyToken, queryCtrl.getAllTickets);
router.post("/response-viewed", verifyToken, queryCtrl.responseViewed);
router.post("/viewed", verifyToken, queryCtrl.queryViewed);
router.get("/stats", verifyToken, queryCtrl.newResponseStats);

export default router;