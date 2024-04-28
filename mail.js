// We are using the web page : courier.com
const { CourierClient } = require("@trycourier/courier");
const courier = new CourierClient({ authorizationToken: "pk_prod_QKTA7NVMJNMQ6EQZ9F18Z1TGJTBT" });

// func: send auth key to a mail
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

// export the func:
module.exports = {sendAuthKey} 

