import QueriesTicket from "../../models/query/queriesTicket.model.js";
import TicketChat from "../../models/query/TicketChat.model.js";
import { catchError, catchErrorWithSequelize, conflictError, frontError, notFound, successOk, successOkWithData, validationError } from "../../utils/responses.js";
import { bodyReqFields, queryReqFields } from "../../utils/requiredFields.js";
import { json } from "sequelize";


// ================================================================
//                          CONTROLLERS
// ================================================================

export async function createNewQueryTicket(req, res) {
    try {
        const reqFields = ["query"];
        const bodyFieldsReq = bodyReqFields(req, res, reqFields);
        if (bodyFieldsReq.error) return bodyFieldsReq.response;

        const { query } = req.body;
        const first_query = query.slice(0, 20) + "...";

        const ticket = await QueriesTicket.create({ first_query, company_user_fk: req.user.uuid });
        await TicketChat.create({ message: query, ticket_fk: ticket.uuid });
        return successOk(res, "Query ticket created successfully");
    } catch (error) {
        return catchErrorWithSequelize(res, error);
    }
};


// ========================== getCompanyTickets ================================


export async function getCompanyTickets(req, res) {
    try {
        let tickets = await QueriesTicket.findAll({
            attributes: { exclude: ['query_viewed'] },
            order: [
                ['responded', 'DESC'],
                ['response_viewed', 'ASC'],
                ['updatedAt', 'DESC'],
            ],
            where: { company_user_fk: req.user.uuid }
        });
        if (!tickets || tickets.length === 0) return notFound(res, "No tickets found");
        tickets = JSON.parse(JSON.stringify(tickets));

        const response = tickets.map(ticket => {
            if (!(ticket.responded && !ticket.response_viewed)) ticket.response_viewed = true;
            const { uuid, createdAt, first_query, response_viewed } = ticket;
            return { uuid, createdAt, first_query, response_viewed };
        });
        return successOkWithData(res, "All tickets", response);
    } catch (error) {
        return catchErrorWithSequelize(res, error);
    }
};

// FOR BOTH INTERNAL AND EXTERNAL DASHBOARD
// ========================== getTicketChat ================================

export async function getTicketChat(req, res) {
    try {
        const queryFieldsReq = queryReqFields(req, res, ["uuid"]);
        if (queryFieldsReq.error) return queryFieldsReq.response;
        const { uuid } = req.query;

        let ticket = await QueriesTicket.findByPk(uuid);
        if (!ticket) return notFound(res, "Ticket not found");

        let chat = await TicketChat.findAll({ where: { ticket_fk: uuid }, order: [['createdAt', 'ASC']], attributes: { exclude: ['ticket_fk'] } });
        if (!chat) return notFound(res, "No chat found");

        return successOkWithData(res, "Ticket chat", chat);
    } catch (error) {
        return catchErrorWithSequelize(res, error);
    }
};



// ========================== futherQueryToTicket =====================================


export async function futherQueryToTicket(req, res) {
    try {
        const reqFields = ["uuid", "query"];
        const bodyFieldsReq = bodyReqFields(req, res, reqFields);
        if (bodyFieldsReq.error) return bodyFieldsReq.response;

        const { uuid, query } = req.body;

        let ticket = await QueriesTicket.findByPk(uuid);
        if (!ticket) return notFound(res, "Ticket not found");

        await TicketChat.create({ message: query, ticket_fk: ticket.uuid });
        ticket.responded = false;
        ticket.query_viewed = false;
        ticket.response_viewed = true;
        await ticket.save();
        return successOk(res, "Query added successfully");
    } catch (error) {
        return catchErrorWithSequelize(res, error);
    }
};

// ========================== responseViewed =====================================

export async function responseViewed(req, res) {
    try {
        const reqFields = ["uuid"];
        const queryFieldsReq = queryReqFields(req, res, reqFields);
        if (queryFieldsReq.error) return queryFieldsReq.response;

        const { uuid } = req.query;
        let ticket = await QueriesTicket.findByPk(uuid);
        if (!ticket) return notFound(res, "Ticket not found");

        if (!ticket.response_viewed) {
            ticket.response_viewed = true;
            await ticket.save();
        }
        return successOk(res, "Response viewed");
    } catch (error) {
        return catchErrorWithSequelize(res, error);
    }
};


// ========================== deleteTicket =====================================


export async function deleteTicket(req, res) {
    try {
        const reqFields = ["uuid"];
        const queryFieldsReq = queryReqFields(req, res, reqFields);
        if (queryFieldsReq.error) return queryFieldsReq.response;

        const { uuid } = req.query;
        await QueriesTicket.destroy({ where: { uuid } });
        return successOk(res, "Ticket deleted successfully");
    } catch (error) {
        console.log("error: ", error);
        return catchErrorWithSequelize(res, error);
    }
};

// ========================== newResponseStats ================================

export async function newResponseStats(req, res) {
    try {
        let newResponsesCount = await QueriesTicket.count({ where: { responded: true, response_viewed: false, company_user_fk: req.user.uuid } });
        return successOkWithData(res, "All tickets", { newResponsesCount });
    } catch (error) {
        return catchErrorWithSequelize(res, error);
    }
}


// FOR INTERNAL DASHBOARD ONLY

// ========================== getAllTickets ================================


export async function getAllTickets(req, res) {
    try {
        let tickets = await QueriesTicket.findAll({
            attributes: { exclude: ['response_viewed'] },
            order: [
                ['query_viewed', 'ASC'],
                ['responded', 'ASC'],
                ['updatedAt', 'DESC'],
            ],
        });

        if (!tickets || tickets.length === 0) return notFound(res, "No tickets found");
        return successOkWithData(res, "All tickets", tickets);
    } catch (error) {
        return catchErrorWithSequelize(res, error);
    }
};

// ========================== queryViewed =====================================


export async function queryViewed(req, res) {
    try {
        const reqFields = ["uuid"];
        const queryFieldsReq = queryReqFields(req, res, reqFields);
        if (queryFieldsReq.error) return queryFieldsReq.response;

        const { uuid } = req.query;
        let ticket = await QueriesTicket.findByPk(uuid);
        if (!ticket) return notFound(res, "Ticket not found");

        if (!ticket.query_viewed) {
            ticket.query_viewed = true;
            await ticket.save();
        }
        return successOk(res, "Query viewed");
    } catch (error) {
        return catchErrorWithSequelize(res, error);
    }
};


// ========================== respondToTicket ================================

export async function respondToTicket(req, res) {
    try {
        const reqFields = ["uuid", "response"];
        const bodyFieldsReq = bodyReqFields(req, res, reqFields);
        if (bodyFieldsReq.error) return bodyFieldsReq.response;

        const { uuid, response } = req.body;

        let ticket = await QueriesTicket.findByPk(uuid);
        if (!ticket) return notFound(res, "Ticket not found");

        await TicketChat.create({ message: response, ticket_fk: ticket.uuid, is_query: false });

        ticket.responded = true;
        ticket.response_viewed = false;
        ticket.query_viewed = true;
        await ticket.save();
        return successOk(res, "Ticket responded successfully");
    } catch (error) {
        return catchErrorWithSequelize(res, error);
    }
}


