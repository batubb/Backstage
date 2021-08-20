const admin = require('firebase-admin');
const functions = require('firebase-functions');
const os = require('os');
const path = require('path');
const fs = require('fs');
const fse = require('fs-extra');

admin.initializeApp();

const servers = {
  EU: 'backstage-ceb27-europe-west6',
  US: 'backstage-ceb27.appspot.com',
};

/**
 * @param {Bucket} bucket_from Bucket reference to download file
 * @param {Bucket} bucket_to Bucket reference to upload file
 * @param {object} object The Cloud Storage file metadata.
 * @param {object} context The event metadata.
 */
async function startFileProcess(bucket_from, bucket_to, object, context) {
  const fileName = object.name;
  const tempFilePath = path.join(os.tmpdir(), fileName);
  const workingDir = path.join(os.tmpdir(), `${object.name.split('/')[0]}/`);
  functions.logger.log({tempFilePath, fileName, workingDir});

  await fse.ensureDir(workingDir);
  await bucket_from
    .file(fileName)
    .download({destination: tempFilePath, validation: false});

  await bucket_to.upload(tempFilePath, {
    destination: fileName,
    contentType: object.contentType,
  });
  return fs.unlinkSync(tempFilePath);
}

exports.multiregionalStorageHandlerEUWEST1 = functions.storage
  .bucket(servers.EU)
  .object()
  .onFinalize(async (object, context) => {
    if (object.bucket !== servers.EU) {
      functions.logger.error({object, context});
      return;
    }
    const bucket_from = admin.storage().bucket(servers.EU);
    const bucket_to = admin.storage().bucket(servers.US);

    functions.logger.log('Received from EUROPE-WEST1 Bucket', {
      object,
      context,
    });

    return await startFileProcess(bucket_from, bucket_to, object, context);
  });

exports.multiregionalStorageHandlerUS = functions.storage
  .bucket(servers.US)
  .object()
  .onFinalize(async (object, context) => {
    if (object.bucket !== servers.US) {
      functions.logger.error({object, context});
      return;
    }
    const bucket_from = admin.storage().bucket(servers.US);
    const bucket_to = admin.storage().bucket(servers.EU);

    functions.logger.log('Received from US Bucket', {
      object,
      context,
    });

    return await startFileProcess(bucket_from, bucket_to, object, context);
  });
