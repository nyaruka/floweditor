const setLogs = (endpoint: string, message: string) => {
  console.log(message, endpoint, 'info');
  //   const orgId = getUserSession('organizationId');
  //   const userId = getUserSession('id');
  //   let logger: any;
  //   if (LOGFLARE_API && LOGFLARE_SOURCE) {
  //     const apiKey = LOGFLARE_API;
  //     const sourceToken = LOGFLARE_SOURCE;
  //     // create pino-logflare stream
  //     const stream = createWriteStream({
  //       apiKey,
  //       sourceToken
  //     });
  //     // create pino-logflare browser stream
  //     const send = createPinoBrowserSend({
  //       apiKey,
  //       sourceToken
  //     });
  //     // create pino logger
  //     logger = pino(
  //       {
  //         browser: {
  //           transmit: {
  //             // @ts-ignore
  //             send
  //           }
  //         }
  //       },
  //       stream
  //     );
  //     let logMessage;
  //     if (typeof message === 'object') {
  //       message = JSON.stringify(message);
  //     }
  //     logMessage = `org_id: ${orgId} user_id: ${userId} [${type}] ${message}`;
  //     // log some events
  //     switch (type) {
  //       case 'info':
  //         logger.info(logMessage);
  //         break;
  //       case 'error':
  //         logger.error(logMessage);
  //         break;
  //       default:
  //         break;
  //     }
  //   }
};

export default setLogs;
