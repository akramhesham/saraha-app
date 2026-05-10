import nodemailer from 'nodemailer';

export const sendMail=async({to,subject,html}={})=>{
    const transporter=nodemailer.createTransport({
        service:'gmail',
        host:'smtp.gmail.com',
        port:587,
        auth:{
            user:'akram.deram@gmail.com',
            pass:'wvsn azbh mnng aakd'
        }
    });

    await transporter.sendMail({
        from:'"saraha app"<akram.deram@gmail.com>',
        to,
        subject,
        html
    });
}