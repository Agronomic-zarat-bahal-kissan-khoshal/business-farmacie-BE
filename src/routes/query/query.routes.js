import express from "express";
import * as queryCtrl from "../../controllers/query/query.controller.js";
import verifyToken from "../../middlewares/authMiddleware.js";
const router = express.Router();

router.route("/ticket")
    .post(verifyToken, queryCtrl.createNewQueryTicket)
    .delete(verifyToken, queryCtrl.deleteTicket);

router.get("/ticket/all", verifyToken, queryCtrl.getCompanyTickets);
router.post("/further", verifyToken, queryCtrl.futherQueryToTicket);
router.get("/ticket-chat", verifyToken, queryCtrl.getTicketChat);
router.post("/response-viewed", verifyToken, queryCtrl.responseViewed);
router.get("/stats", verifyToken, queryCtrl.newResponseStats);

export default router;