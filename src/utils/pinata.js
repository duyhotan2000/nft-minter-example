require('dotenv').config();
const key = process.env.REACT_APP_PINATA_KEY;
const secret = process.env.REACT_APP_PINATA_SECRET;

const axios = require('axios');

export const pinJSONToIPFS = async(JSONBody) => {
    const url = `https://api.pinata.cloud/pinning/pinJSONToIPFS`;
    const requestData = {
        pinataMetadata: {
            name: "metadata.json"
        },
        pinataOptions: {
            cidVersion: 0,
            wrapWithDirectory: true
        },
        pinataContent: JSONBody
    }
    //making axios POST request to Pinata ⬇️
    return axios 
        .post(url, requestData, {
            headers: {
                pinata_api_key: key,
                pinata_secret_api_key: secret,
            }
        })
        .then(function (response) {
           return {
               success: true,
               pinataUrl: "https://gateway.pinata.cloud/ipfs/" + response.data.IpfsHash + "/metadata.json",
               ipfsUrl: `ipfs://${response.data.IpfsHash}/metadata.json`
           }
        })
        .catch(function (error) {
            console.log(error)
            return {
                success: false,
                message: error.message,
            }

    });
};

export const pinFileToIPFS = async (file) => {
    const url = `https://api.pinata.cloud/pinning/pinFileToIPFS`;
    const pinataOptions = {
        cidVersion: 0,
        wrapWithDirectory: true
    };
    const formData = new FormData();
    formData.append('file', file);
    formData.append('pinataOptions', JSON.stringify(pinataOptions));
    //making axios POST request to Pinata ⬇️
    return axios 
        .post(url, formData, {
            withCredentials: true,
            maxContentLength: 'Infinity', //this is needed to prevent axios from erroring out with large files
            maxBodyLength: 'Infinity',
            headers: {
                pinata_api_key: key,
                pinata_secret_api_key: secret,
                'Content-type': `multipart/form-data; boundary= ${formData._boundary}`,
            }
        })
        .then(function (response) {
           return {
               success: true,
               cid: response.data.IpfsHash
           };
        })
        .catch(function (error) {
            console.log(error)
            return {
                success: false,
                message: error.message,
            }

    });
}