const fs = require('fs');

const AWS = require('aws-sdk');
const config = require('config');
const { resolve } = require('path');
const { reject } = require('bluebird');
const Boom = require('@hapi/boom');
const errorHelper = require('@utilities/error-helper');

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
});

const uploadLocalFile = (file, filePath) => {
  return new Promise((resolve, reject) => {
    let filename = file.hapi.filename;
    const fileType = file.hapi.filename.replace(/^.*\./, '');
    const uniqueNum = new Date().getMilliseconds();
    filename = uniqueNum + '_' + filename.replace(' ', '_');

    const data = file._data;
    let imagePath = 'uploads/';
    let path = './uploads';

    if (!fs.existsSync(path)) {
      fs.mkdirSync(path, { recursive: true });
    }

    if (!fs.existsSync(path)) {
      fs.mkdirSync(path, { recursive: true });
    }

    if (filePath) {
      path = `${path}/${filePath}`;
      imagePath = `${imagePath}${filePath}/`;
    }

    if (!fs.existsSync(path)) {
      fs.mkdirSync(path, { recursive: true });
    }

    fs.writeFile(`${path}/` + filename, data, (err) => {
      if (err) {
        reject(err);
      }
      resolve({
        message: 'Uploaded successfully!',
        success: true,
        filePath: `${imagePath}${filename}`,
        fileName: filename,
        fileType: fileType,
      });
    });
  });
};

const handleFileUpload = (file, filePath = null) => {
  //  return uploadLocalFile(file, filePath)
  return uploadFileToBucket(file, filePath);
};

const uploadFileToBucket = (file, filePath) => {
  return new Promise((resolve, reject) => {
    const data = file._data;
    let filename = file.hapi.filename;
    const fileType = filename.replace(/^.*\./, '');

    const uniqueNum = new Date().getMilliseconds();
    filename = uniqueNum + '_' + filename.replace(' ', '_');
    if (!filePath) {
      filePath = 'profile';
    }
    const params = {
      Bucket: 'b-mart', // pass your bucket name
      Key: `${filePath}/${filename}`, // file will be saved as testBucket/contacts.csv
      Body: data,
    };
    s3.upload(params, (s3Err, data) => {
      if (s3Err) {
        resolve({
          message: 'Upload Fail!',
          success: false,
          error: JSON.stringify(s3Err),
        });
        // throw s3Err
      }
      resolve({
        message: 'Uploaded successfully!',
        success: true,
        filePath: `${filePath}/${filename}`,
        fileName: filename,
        fileType: fileType,
      });
    });
  });
};

module.exports = {
  uploadLocalFile,
  uploadFileToBucket,
  handleFileUpload,
};
