import nodemailer from 'nodemailer';

interface EmailConfig {
  host: string;
  port: number;
  secure: boolean;
  user: string;
  pass: string;
  from: string;
}

interface EmailTemplate {
  subject: string;
  html: string;
  text: string;
}

export class EmailService {
  private transporter: nodemailer.Transporter;
  private config: EmailConfig;

  constructor() {
    this.config = {
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true',
      user: process.env.SMTP_USER || '',
      pass: process.env.SMTP_PASS || '',
      from: process.env.EMAIL_FROM || 'noreply@attendance.com'
    };

    this.transporter = nodemailer.createTransport({
      host: this.config.host,
      port: this.config.port,
      secure: this.config.secure,
      auth: {
        user: this.config.user,
        pass: this.config.pass
      }
    });
  }

  async sendAttendanceReminder(employeeEmail: string, employeeName: string, employeeId: string): Promise<void> {
    const template = this.getAttendanceReminderTemplate(employeeName, employeeId);
    
    await this.sendEmail(employeeEmail, template.subject, template.html, template.text);
  }

  async sendDailyAbsenteeReport(adminEmail: string, absentEmployees: any[], date: string): Promise<void> {
    const template = this.getDailyAbsenteeReportTemplate(absentEmployees, date);
    
    await this.sendEmail(adminEmail, template.subject, template.html, template.text);
  }

  async sendWeeklyReport(recipientEmail: string, reportData: any): Promise<void> {
    const template = this.getWeeklyReportTemplate(reportData);
    
    await this.sendEmail(recipientEmail, template.subject, template.html, template.text);
  }

  private async sendEmail(to: string, subject: string, html: string, text: string): Promise<void> {
    try {
      await this.transporter.sendMail({
        from: this.config.from,
        to,
        subject,
        html,
        text
      });
      console.log(`Email sent successfully to ${to}`);
    } catch (error) {
      console.error(`Failed to send email to ${to}:`, error);
      throw error;
    }
  }

  private getAttendanceReminderTemplate(employeeName: string, employeeId: string): EmailTemplate {
    const subject = '🕐 Attendance Reminder - Please Mark Your Attendance';
    
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #007bff; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background-color: #f8f9fa; padding: 30px; border-radius: 0 0 8px 8px; }
            .button { display: inline-block; padding: 12px 24px; background-color: #28a745; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            .warning { background-color: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 5px; margin: 20px 0; }
            .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #666; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🕐 Attendance Reminder</h1>
            </div>
            <div class="content">
              <h2>Hello ${employeeName},</h2>
              <p><strong>Employee ID:</strong> ${employeeId}</p>
              
              <div class="warning">
                <strong>⚠️ ATTENDANCE NOT MARKED</strong><br>
                We notice that you haven't marked your attendance for today yet. Please mark your attendance as soon as possible.
              </div>
              
              <p><strong>Current Time:</strong> ${new Date().toLocaleString()}</p>
              <p><strong>Reminder:</strong> Please mark your attendance before the end of your shift.</p>
              
              <a href="${process.env.FRONTEND_URL || 'https://attendance.company.com'}" class="button">
                Mark Attendance Now
              </a>
              
              <p>If you're working from home or on leave, please ensure you've informed your supervisor.</p>
              
              <hr>
              <p><em>This is an automated reminder. If you have already marked your attendance, please ignore this email.</em></p>
            </div>
            <div class="footer">
              <p>© ${new Date().getFullYear()} Company Attendance System</p>
            </div>
          </div>
        </body>
      </html>
    `;

    const text = `
      Attendance Reminder
      
      Hello ${employeeName},
      Employee ID: ${employeeId}
      
      ATTENDANCE NOT MARKED
      We notice that you haven't marked your attendance for today yet. Please mark your attendance as soon as possible.
      
      Current Time: ${new Date().toLocaleString()}
      
      Please visit ${process.env.FRONTEND_URL || 'https://attendance.company.com'} to mark your attendance.
      
      If you're working from home or on leave, please ensure you've informed your supervisor.
      
      This is an automated reminder.
    `;

    return { subject, html, text };
  }

  private getDailyAbsenteeReportTemplate(absentEmployees: any[], date: string): EmailTemplate {
    const subject = `📊 Daily Absentee Report - ${date}`;
    
    const employeeRows = absentEmployees.map(emp => `
      <tr>
        <td>${emp.employeeId}</td>
        <td>${emp.firstName} ${emp.lastName}</td>
        <td>${emp.section}</td>
        <td>${emp.department || 'N/A'}</td>
        <td>${emp.designation || 'N/A'}</td>
      </tr>
    `).join('');

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 800px; margin: 0 auto; padding: 20px; }
            .header { background-color: #dc3545; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background-color: #f8f9fa; padding: 30px; border-radius: 0 0 8px 8px; }
            table { width: 100%; border-collapse: collapse; margin: 20px 0; }
            th, td { padding: 12px; text-align: left; border-bottom: 1px solid #ddd; }
            th { background-color: #007bff; color: white; }
            .stats { display: flex; justify-content: space-around; margin: 20px 0; }
            .stat-box { background-color: white; padding: 20px; border-radius: 8px; text-align: center; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
            .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #666; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>📊 Daily Absentee Report</h1>
              <h2>${date}</h2>
            </div>
            <div class="content">
              <div class="stats">
                <div class="stat-box">
                  <h3>${absentEmployees.length}</h3>
                  <p>Absent Employees</p>
                </div>
              </div>
              
              <h3>Absent Employees List:</h3>
              <table>
                <thead>
                  <tr>
                    <th>Employee ID</th>
                    <th>Name</th>
                    <th>Section</th>
                    <th>Department</th>
                    <th>Designation</th>
                  </tr>
                </thead>
                <tbody>
                  ${employeeRows}
                </tbody>
              </table>
              
              <p><em>Generated at: ${new Date().toLocaleString()}</em></p>
            </div>
            <div class="footer">
              <p>© ${new Date().getFullYear()} Company Attendance System - Admin Report</p>
            </div>
          </div>
        </body>
      </html>
    `;

    const text = `
      Daily Absentee Report - ${date}
      
      Absent Employees: ${absentEmployees.length}
      
      Employee List:
      ${absentEmployees.map(emp => `${emp.employeeId} - ${emp.firstName} ${emp.lastName} (${emp.section})`).join('\n')}
      
      Generated at: ${new Date().toLocaleString()}
    `;

    return { subject, html, text };
  }

  private getWeeklyReportTemplate(reportData: any): EmailTemplate {
    const subject = `📈 Weekly Attendance Report - Week of ${reportData.weekStart}`;
    
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 800px; margin: 0 auto; padding: 20px; }
            .header { background-color: #28a745; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background-color: #f8f9fa; padding: 30px; border-radius: 0 0 8px 8px; }
            .stats { display: flex; justify-content: space-around; margin: 20px 0; flex-wrap: wrap; }
            .stat-box { background-color: white; padding: 20px; border-radius: 8px; text-align: center; box-shadow: 0 2px 4px rgba(0,0,0,0.1); margin: 10px; min-width: 150px; }
            .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #666; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>📈 Weekly Attendance Report</h1>
              <h2>Week of ${reportData.weekStart} - ${reportData.weekEnd}</h2>
            </div>
            <div class="content">
              <div class="stats">
                <div class="stat-box">
                  <h3>${reportData.totalEmployees}</h3>
                  <p>Total Employees</p>
                </div>
                <div class="stat-box">
                  <h3>${reportData.averageAttendance}%</h3>
                  <p>Average Attendance</p>
                </div>
                <div class="stat-box">
                  <h3>${reportData.perfectAttendance}</h3>
                  <p>Perfect Attendance</p>
                </div>
              </div>
              
              <h3>Weekly Summary</h3>
              <p>This week's attendance performance shows ${reportData.averageAttendance}% average attendance rate.</p>
              
              <p><em>Report generated: ${new Date().toLocaleString()}</em></p>
            </div>
            <div class="footer">
              <p>© ${new Date().getFullYear()} Company Attendance System</p>
            </div>
          </div>
        </body>
      </html>
    `;

    const text = `
      Weekly Attendance Report
      Week of ${reportData.weekStart} - ${reportData.weekEnd}
      
      Total Employees: ${reportData.totalEmployees}
      Average Attendance: ${reportData.averageAttendance}%
      Perfect Attendance: ${reportData.perfectAttendance}
      
      Report generated: ${new Date().toLocaleString()}
    `;

    return { subject, html, text };
  }
}

export const emailService = new EmailService();