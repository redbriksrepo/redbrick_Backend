const Broker = require('../../models/broker/broker.model')
const exceljs = require('exceljs')
const path = require('path')
const nodemailer = require('nodemailer')
const Proposal = require('../../models/proposal/proposal.model')
const mongoose = require('mongoose')

const brokerReport = async (req, res, next) => {
  const user = req.user
  // console.log(user)
  try {
    var date = new Date()
    const month = date.getMonth()
    const year = date.getFullYear()
    date = new Date().toLocaleString();
    const data = await Broker.find();

    const workbook = new exceljs.Workbook();
    const worksheet = workbook.addWorksheet('brokerReport');
    // Define your columns and headers...
    worksheet.columns = [
      { header: 'brokerCategory', key: 'brokerCategory', width: 15 },
      { header: 'SPOCName', key: 'SPOCName', width: 15 },
      { header: 'brokerType', key: 'brokerType', width: 13 },
      { header: 'SPOCNumber', key: 'SPOCNumber', width: 15 },
      { header: 'SPOCEmail', key: 'SPOCEmail', width: 20 },
      { header: 'createdAt', key: 'createdAt', width: 12 },
      { header: 'updatedAt', key: 'updatedAt', width: 12 },
      { header: 'totalProposals', key: 'totalProposals', width: 14 },
      { header: 'approveProposals', key: 'approveProposals', width: 17 },
      { header: 'inProgressProposals', key: 'inProgressProposals', width: 19 },
      { header: 'thisMonthProposals', key: 'thisMonthProposals', width: 20 }
    ];
    const promises = data.map(async (broker, index) => {
      const totalProposalCount = await Proposal.countDocuments({ brokerCategory: mongoose.Types.ObjectId(broker._id) });
      const approveProposalCount = await Proposal.countDocuments({
        brokerCategory: mongoose.Types.ObjectId(broker._id),
        $or: [
          { status: "Completed and approved" },
          { status: "Completed and Locked" },
        ],
      });
       const thisMonthProposals = await Proposal.find({ brokerCategory: mongoose.Types.ObjectId(broker._id), createdAt: { $gte: new Date(year, month - 1, 1), $lt: new Date(year, month, 1) } })
       console.log(thisMonthProposals.length)

      const inProgressProposalCount = totalProposalCount - approveProposalCount;
      let editObj = broker.toObject();
      editObj.totalProposals = totalProposalCount;
      editObj.approveProposals = approveProposalCount;
      editObj.inProgressProposals = inProgressProposalCount;
      editObj.thisMonthProposals = thisMonthProposals.length;
      // console.log(editObj)
      worksheet.addRow(editObj);
    });
    // return next("thisMonthProposals")
    await Promise.all(promises);
    // workbook.title = `Brokers Report`;
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'ffff00' },
    };
    worksheet.getRow(1).font = {
      bold: true
    }
    await workbook.xlsx.writeFile(path.join('weeklyReport/BrokersReport', `All Brokers Report.xlsx`));

    const transporter = nodemailer.createTransport({
      service: process.env.NODEMAILER_SERVICE,
      auth: {
        user: process.env.NODEMAILER_AUTH_USER,
        pass: process.env.NODEMAILER_AUTH_PASSWORD
      }
    });

    const mailOptions = {
      from: process.env.NODEMAILER_AUTH_USER,
      to: user.userName,
      subject: `Brokers Report ${date}`,
      text: `Attached is the Brokers report of ${date}`,
      attachments: [
        {
          path: path.join('weeklyReport/BrokersReport', `All Brokers Report.xlsx`),
          filename: `All Brokers Report ${date}.xlsx`
        }
      ]
    };
    res.status(200).send('Email sent successfully');
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        return next(error);
      } else {
        res.status(200).send('Email sent successfully');
      }
    });

  } catch (err) {
    if (!err.message) err.message = 'Something went wrong';
    return next(err);
  }
}
module.exports = brokerReport;
// const Broker = require('../../models/broker/broker.model')
// const exceljs = require('exceljs')
// const path = require('path')
// const nodemailer = require('nodemailer')

// const brokerReport = (req, res, next) => {
//   const user = req.user
//   // console.log(user)
//   try{
//   Broker.find().then((data) => {
//     // console.log(data[0]._id.toString())
//     const workbook = new exceljs.Workbook();
//     const worksheet = workbook.addWorksheet('brokerReport');
//     // Define your columns and headers
//     worksheet.columns = [
//       { header: 'brokerCategory', key: 'brokerCategory', width: 15 },
//       { header: 'SPOCName', key: 'SPOCName', width: 15 },
//       { header: 'brokerType', key: 'brokerType', width: 15 },
//       { header: 'SPOCNumber', key: 'SPOCNumber', width: 15 },
//       { header: 'SPOCEmail', key: 'SPOCEmail', width: 15 },
//       { header: 'createdAt', key: 'createdAt', width: 15 },
//       { header: 'updatedAt', key: 'updatedAt', width: 15 }
//     ];
//     data.forEach(rowData => {
//       worksheet.addRow(rowData);
//     });
//     worksheet.getRow(1).fill = {
//       type: 'pattern',
//       pattern: 'solid',
//       fgColor: { argb: 'ffff00' },
//     };
//     worksheet.getRow(1).font = {
//       bold: true
//     }
//     workbook.xlsx.writeFile(path.join('weeklyReport/BrokersReport', `${user._id}.xlsx`))
//       .then(() => {
//         const transporter = nodemailer.createTransport({
//           service: process.env.NODEMAILER_SERVICE,
//           auth: {
//             user: process.env.NODEMAILER_AUTH_USER,
//             pass: process.env.NODEMAILER_AUTH_PASSWORD
//           }
//         });
//         const mailOptions = {
//           from: process.env.NODEMAILER_AUTH_USER,
//           to: user.userName,
//           subject: 'Brokers Report',
//           text: 'Attached is the Brokers report.',
//           attachments: [
//             {
//               path: path.join('weeklyReport/BrokersReport', `${user._id}.xlsx`),
//               filename: `Broker Report from ${user._id}.xlsx`
//           }
//           ]
//         };
//         transporter.sendMail(mailOptions, (error, info) => {
//           if (error) {
//             return next(error)
//           } else {
//             res.status(200).send('Email send successfully')
//           }
//         });
//         // res.status(200).send('Excel report saved')
//       })
//       .catch((err) => {
//         if (!err.message) err.message = 'Something went wrong';
//         return next(err);
//     });

//   }).catch((err) => {
//     if (!err.message) err.message = 'Something went wrong';
//     return next(err);
// })
// }catch (err) {
//   if (!err.message) err.message = 'Something went wrong';
//   next(err);
// }
// }
// module.exports = brokerReport;