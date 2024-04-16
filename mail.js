// Using : courier.com

const { CourierClient } = require("@trycourier/courier");

const courier = new CourierClient({ authorizationToken: "pk_prod_QKTA7NVMJNMQ6EQZ9F18Z1TGJTBT" });

const sendEmailOfCycle = async (userMail, courseToGive, toUser, courseToGet, fromUser) => {
    const { requestId } = await courier.send({
        message: {
            to: {
            email: "course.exchange.neta@gmail.com", //userMail
            },
            template: "Q4M18SCYWVMF01GWEES7X365ZFRZ",
            data: {
            user: userMail,
            userToGet: courseToGive,
            courseToGet: toUser,
            userToGive: courseToGet,
            courseToGive: fromUser
            },
        },
    });
};

const sendAuthKey = async (key, userMail) => {
    console.log("function: sendAuthKey of:", key, " to email:", userMail);
    // const { requestId } =
    courier.send({
        message: {
          to: {
            email: userMail,
          },
          template: "8XY63Q4GSZMYAZH4E9XM3QGGCN1X",
          data: {
            key: key,
          },
        },
      }).catch( (e)=>
        console.log("ERROR: ", e)
      );
};

module.exports = {sendEmailOfCycle, sendAuthKey} 

