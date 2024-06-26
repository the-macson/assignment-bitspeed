const contacts = require("./contact.modal");
const sequelize = require("./db.config");
const { Op } = require("sequelize");
const Sequelize = require("sequelize");

const createNewContact = async (email, phoneNumber) => {
  try {
    const contact = await contacts.create({
      email,
      phoneNumber,
    });
    return contact;
  } catch (error) {
    console.log("Error in createNewContact", error);
    return error;
  }
};

const findByLinkPrecedence = async (linkPrecedence, email, phoneNumber) => {
  try {
    const contact = await contacts.findAll({
      where: {
        linkPrecedence,
        [Op.or]: [{ email }, { phoneNumber }],
      },
    });
    return contact;
  } catch (error) {
    console.log(error);
    return error;
  }
};

const findByLinkPrecedenceAndLinkedId = async (linkPrecedence, id) => {
  try {
    const contact = await sequelize.query(
      `select * from ((WITH RECURSIVE Descendants AS (
            SELECT "id", "phoneNumber", "linkedId", "email", "linkPrecedence"
            FROM contacts
            WHERE id = :id
            UNION ALL
            SELECT c.id, c."phoneNumber", c."linkedId", c.email , c."linkPrecedence"
            FROM contacts c 
            INNER JOIN Descendants d ON c."linkedId" = d.id
        )
        SELECT * FROM Descendants)
        UNION
        (WITH RECURSIVE Ancestors AS (
            SELECT "id", "phoneNumber", "linkedId", "email" , "linkPrecedence"
            FROM contacts
            WHERE id = :id
            UNION ALL
            SELECT c.id, c."phoneNumber", c."linkedId", c.email , c."linkPrecedence"
            FROM contacts c 
            INNER JOIN Ancestors d ON c.id = d."linkedId"
        )
        SELECT * FROM Ancestors)) as c where c."linkPrecedence" = :linkPrecedence`,
      {
        type: Sequelize.QueryTypes.SELECT,
        raw: true,
        replacements: { id, linkPrecedence },
      }
    );
    return contact;
  } catch (error) {
    console.log(error);
    return error;
  }
};

const createSecondaryContact = async (email, phoneNumber, linkedId) => {
  try {
    const contact = await contacts.create({
      email,
      phoneNumber,
      linkedId,
      linkPrecedence: "secondary",
    });
    return contact;
  } catch (error) {
    console.log("Error in createSecondaryContact", error);
    return error;
  }
};

const findIntersection = async (email, phoneNumber) => {
  try {
    const contact = await sequelize.query(
      `select * from ((WITH RECURSIVE Descendants AS (
            SELECT "id", "phoneNumber", "linkedId", "email"
            FROM contacts
            WHERE "phoneNumber" = :phoneNumber
            UNION ALL
            SELECT c.id, c."phoneNumber", c."linkedId", c.email 
            FROM contacts c 
            INNER JOIN Descendants d ON c."linkedId" = d.id
        )
        SELECT * FROM Descendants)
        UNION
        (WITH RECURSIVE Ancestors AS (
            SELECT "id", "phoneNumber", "linkedId", "email" 
            FROM contacts
            WHERE "phoneNumber"= :phoneNumber
            UNION ALL
            SELECT c.id, c."phoneNumber", c."linkedId", c.email 
            FROM contacts c 
            INNER JOIN Ancestors d ON c.id = d."linkedId"
        )
        SELECT * FROM Ancestors)) as c where c.email = :email`,
      {
        type: Sequelize.QueryTypes.SELECT,
        raw: true,
        replacements: { email, phoneNumber },
      }
    );
    return contact;
  } catch (error) {
    console.log(error);
    return error;
  }
};

const findOneForUpdate = async (email, phoneNumber) => {
  try {
    const contact = await contacts.findAll({
      where: {
        ...(email ? { email } : {}),
        ...(phoneNumber ? { phoneNumber } : {}),
      },
      lock: true,
    });
    return contact;
  } catch (error) {
    console.log(error);
    return error;
  }
};

const findByEmail = async (email) => {
  try {
    const contact = await contacts.findAll({
      where: {
        email,
      },
      attributes: ["id", "email", "phoneNumber"],
    });
    return contact;
  } catch (error) {
    console.log(error);
    return error;
  }
};

const findByPhoneNumber = async (phoneNumber) => {
  try {
    const contact = await contacts.findAll({
      where: {
        phoneNumber,
      },
    });
    return contact;
  } catch (error) {
    console.log(error);
    return error;
  }
};

const createNewEmail = async (email) => {
  try {
    const contact = await contacts.create({
      email,
    });
    return contact;
  } catch (error) {
    console.log("Error in createNewContact", error);
    return error;
  }
};

const createNewPhoneNumber = async (phoneNumber) => {
  try {
    const contact = await contacts.create({
      phoneNumber,
    });
    return contact;
  } catch (error) {
    console.log("Error in createNewContact", error);
    return error;
  }
};

module.exports = {
  createNewContact,
  findByLinkPrecedence,
  findByLinkPrecedenceAndLinkedId,
  createSecondaryContact,
  findIntersection,
  findOneForUpdate,
  findByEmail,
  findByPhoneNumber,
  createNewEmail,
  createNewPhoneNumber,
};