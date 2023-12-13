import { Injectable } from '@nestjs/common';
import * as net from 'net';
import { parseString } from 'xml2js';
import axios from 'axios';

@Injectable()
export class TcpServerService {
  startServer(): void {
    let deviceNum = null;

    //ตรวจสอบ Mode การทำงาน
    if (process.env.DEBUG_MODE === 'true') {
      console.log('debug mode')
    } else if (process.env.DEBUG_MODE === 'false') {
      console.log('production')
      console.log(`http://${process.env.IP_OUTPUT}:3000/api/acm/input`)
    }

    const server = net.createServer((socket) => {
      console.log('Client connected');

      socket.on('data', (data) => {
        const xmlData = data.toString();

        try {
          // แปลงค่า xml เป็น json
          parseString(xmlData, { explicitArray: false }, (err, result) => {
            if (err) {
              console.error('Error parsing XML:', err);
              return;
            }

            const jsonData = JSON.stringify(result);
            // console.log('Received JSON:', jsonData);

            //ตัดคำเอาเฉพาะที่อยู่ใน (21)  เลข21 คือ device-Number
            // console.log(result.EVENT.plasectrxSourcename)
            const str = result.EVENT.plasectrxSourcename //'FLOOR 2 TS2 IN (21)';
            const regex = /\(([^)]+)\)/;  //ใช้ (21)

            const matches = str.match(regex);
            //เนื่องจากมีการตั้งชื่อ ใช้ ( ) ปนเข้ามา
            // console.log(`matches ${matches}`)


            if (matches) {
              deviceNum = matches[1];
              const checkDeviceNumb = parseInt(deviceNum)    // convert deviceNum_string to deviceNum_num

              // console.log(`deviceNum : ${deviceNum}`); // แสดง '21'
              // สร้าง output ที่ต้องการ
              const output = {
                "token": result.EVENT.plasectrxCardno,
                "deviceNum": deviceNum
              };
              const outputJson = JSON.stringify(output);


              // console.log(`OUTPUT: ${JSON.stringify(output)}`)

              // ส่ง JSON ไปยัง API
              // this.sendJsonToApi(jsonData);
              // ตรวจสอบ ค่าใน output ก่อนส่งจริง
              if (!isNaN(checkDeviceNumb) && !(result.EVENT.plasectrxCardno==null)) {
                this.sendJsonToApi(outputJson);
                console.log(`OUTPUT SENT: ${JSON.stringify(output)}`)
              }else{
                console.log(`ไม่ส่งข้อมูล ข้อมูลไม่ครบถ้วน`)
              }

            } else {
              console.log('ไม่พบตัวเลขในวงเล็บ');
              deviceNum = null;
            }
          });

        } catch (error) {
          console.error('Error:', error.message);
        }


      });

      socket.on('end', () => {
        console.log('Client disconnected');
      });
    });

    server.listen(5400, () => {
      console.log(`version: ${process.env.VERSION} `)
      console.log('TCP server is listening on port 5400');
    });
  }

  private async sendJsonToApi(jsonData: string): Promise<void> {
    const apiUrl = `http://${process.env.IP_OUTPUT}:3000/api/acm/input`; // ใส่ URL ของ API ที่ต้องการส่งข้อมูล
    // const apiUrl = `http://127.0.0.1:3000/api/acm/input`; // ใส่ URL ของ API ที่ต้องการส่งข้อมูล

    console.log(apiUrl);
    try {
      await axios.post(apiUrl, jsonData, {
        headers: { 'Content-Type': 'application/json' },
      });
      console.log('Data sent to API successfully');
    } catch (error) {
      console.error('Error sending data to API:', error.message);
    }
  }
}
