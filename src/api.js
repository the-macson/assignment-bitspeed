const express = require("express");
const contacts = require("./contact.modal");
const { Op } = require("sequelize");
const router = express.Router();

const {
  createNewContact,
  createSecondaryContact,
  findIntersection,
  findOneForUpdate,
  findByEmail,
  findByPhoneNumber,
  createNewEmail,
  createNewPhoneNumber,
  findByLinkPrecedenceAndLinkedId,
} = require("./service");

router.post("/identify", async (req, res) => {
  try {
    let { email, phoneNumber } = req.body;
    if (!email && !phoneNumber) {
      return res.status(400).send("Email or Phone Number is required");
    }
    if (!email) email = null;
    if (!phoneNumber) phoneNumber = null;
    if (email && !phoneNumber) {
      const contact = await findByEmail(email);
      if (contact.length === 0) {
        const newContact = await createNewEmail(email);
      }
    } else if (phoneNumber && !email) {
      const contact = await findByPhoneNumber(phoneNumber);
      if (contact.length === 0) {
        const newContact = await createNewPhoneNumber(phoneNumber);
      }
    } else {
      const contact = await contacts.findAll({
        where: {
          [Op.or]: [{ email }, { phoneNumber }],
        },
      });
      const mobileContact = await findByPhoneNumber(phoneNumber);
      const emailContact = await findByEmail(email);
      if (contact.length === 0) {
        const newContact = await createNewContact(email, phoneNumber);
      } else {
        if (mobileContact.length === 0) {
          const secondaryContact = await createSecondaryContact(
            email,
            phoneNumber,
            contact[0].id
          );
        } else if (emailContact.length === 0) {
          const secondaryContact = await createSecondaryContact(
            email,
            phoneNumber,
            contact[0].id
          );
        }
        if (contact.length > 1) {
          const intersection = await findIntersection(email, phoneNumber);
          if (intersection.length === 0) {
            const left = await findOneForUpdate(email, null);
            const right = await findOneForUpdate(null, phoneNumber);
            if (left[0].id > right[0].id) {
              const updateLeft = await contacts.update(
                {
                  linkedId: right[0].id,
                  linkPrecedence: "secondary",
                },
                {
                  where: {
                    email,
                  },
                }
              );
            } else {
              const updateRight = await contacts.update(
                {
                  linkedId: left[0].id,
                  linkPrecedence: "secondary",
                },
                {
                  where: {
                    phoneNumber,
                  },
                }
              );
            }
          }
        }
      }
    }
    const contact = await contacts.findAll({
      where: {
        [Op.or]: [
          ...(email ? [{ email }] : []),
          ...(phoneNumber ? [{ phoneNumber }] : []),
        ],
      },
    });
    const primaryContact = await findByLinkPrecedenceAndLinkedId(
      "primary",
      contact[0].id
    );
    const secondaryContact = await findByLinkPrecedenceAndLinkedId(
      "secondary",
      contact[0].id
    );
    const contactDetails = {
      primaryContatctId: primaryContact[0].id,
      emails: Array.from(
        new Set(
          [
            primaryContact[0].email,
            ...secondaryContact.map((contact) => contact.email),
          ].filter((email) => email !== null)
        )
      ),
      phoneNumbers: Array.from(
        new Set(
          [
            primaryContact[0].phoneNumber,
            ...secondaryContact.map((contact) => contact.phoneNumber),
          ].filter((phoneNumber) => phoneNumber !== null)
        )
      ),
      secondaryContactIds: secondaryContact.map((contact) => contact.id),
    };
    res.status(200).send({
      contact: contactDetails,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send("Internal Server Error");
  }
});

module.exports = router;
