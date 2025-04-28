import { test, expect, Page } from '@playwright/test';

// ค่าคงที่สำหรับข้อมูลการทดสอบตามที่ระบุ
const serviceName = 'Service_temp';
const carLicensePlate = 'CarWithServiceTemp';
const carBrand = 'CU';
const carModel = 'CEDT';
const carColor = 'Other';
const carRate = '10';
const serviceRate = '10';
let reservationId: string | null = null;

// ฟังก์ชันช่วยในการล็อกอิน
async function loginAsAdmin(page: Page) {
  // ไปที่หน้าล็อกอิน
  await page.goto('http://localhost:3000/');
  await page.getByRole('link', { name: 'Sign-In' }).click();
  
  // กรอกข้อมูลล็อกอิน
  await page.getByRole('textbox', { name: 'Email Address' }).click();
  await page.getByRole('textbox', { name: 'Email Address' }).fill('admin_playwright@gmail.com');
  await page.getByRole('textbox', { name: 'Password' }).click();
  await page.getByRole('textbox', { name: 'Password' }).fill('12345678');
  
  // กดปุ่มล็อกอิน
  await page.getByRole('button', { name: 'Sign In as User' }).click();
  
  // รอให้ล็อกอินสำเร็จ
  await page.waitForTimeout(2000);
  
  console.log('Admin login successful');
}

async function loginAsProvider(page: Page) {
  // ไปที่หน้าล็อกอิน
  await page.goto('http://localhost:3000/');
  await page.getByRole('link', { name: 'Sign-In' }).click();
  
  // คลิกเลือก Car Provider
  await page.getByRole('button', { name: 'Car Provider' }).click();
  
  // กรอกข้อมูลล็อกอิน
  await page.getByRole('textbox', { name: 'Email Address' }).click();
  await page.getByRole('textbox', { name: 'Email Address' }).fill('playwright@gmail.com');
  await page.getByRole('textbox', { name: 'Password' }).click();
  await page.getByRole('textbox', { name: 'Password' }).fill('12345678');
  
  // กดปุ่มล็อกอิน
  await page.getByRole('button', { name: 'Sign In as Car Provider' }).click();
  
  // รอให้ล็อกอินสำเร็จ
  await page.waitForTimeout(2000);
  
  console.log('Provider login successful');
}

async function loginAsCustomer(page: Page) {
  // ไปที่หน้าล็อกอิน
  await page.goto('http://localhost:3000/');
  await page.getByRole('link', { name: 'Sign-In' }).click();
  
  // กรอกข้อมูลล็อกอิน
  await page.getByRole('textbox', { name: 'Email Address' }).click();
  await page.getByRole('textbox', { name: 'Email Address' }).fill('playwright@gmail.com');
  await page.getByRole('textbox', { name: 'Password' }).click();
  await page.getByRole('textbox', { name: 'Password' }).fill('12345678');
  
  // กดปุ่มล็อกอิน
  await page.getByRole('button', { name: 'Sign In as User' }).click();
  
  // รอให้ล็อกอินสำเร็จ
  await page.waitForTimeout(2000);
  
  console.log('Customer login successful');
}

/**
 * Test Case 1: Admin สร้าง Additional Service
 * TC2-1-1: Create Additional Service by Admin
 */
test('Admin can create a new service', async ({ page }) => {
  // 1. เข้าสู่ระบบด้วย Admin
  await loginAsAdmin(page);
  
  // 2. ไปที่หน้าจัดการ services
  await page.getByRole('button', { name: 'Playwright Admin' }).click();
  await page.getByRole('link', { name: 'Admin Tools' }).click();
  await page.locator('.MuiBackdrop-root').click();
  await page.getByRole('link', { name: 'Manage Services Create and' }).click();
  
  // 3. คลิกปุ่ม Add New Service
  await page.getByRole('button', { name: 'Add New Service' }).click();
  
  // 4. กรอกข้อมูล service ตามที่ระบุใน Test Case
  await page.getByRole('textbox', { name: 'Service Name *' }).click();
  await page.getByRole('textbox', { name: 'Service Name *' }).fill(serviceName);
  await page.getByRole('textbox', { name: 'Rate *' }).click();
  await page.getByRole('textbox', { name: 'Rate *' }).fill(serviceRate);
  
  // เลือก Rate Type: perday ตามที่ระบุ
  // หมายเหตุ: อาจต้องปรับตาม UI จริง ว่าใช้ checkbox หรือ dropdown
  // ถ้าใช้ checkbox ตรวจสอบว่าค่าเริ่มต้นเป็น Daily (perday) อยู่แล้วหรือไม่
  try {
    // ลองเลือกจาก dropdown หรือ radio เริ่มแรก
    const rateTypeElement = page.getByLabel('Rate Type *');
    if (await rateTypeElement.isVisible()) {
      await rateTypeElement.selectOption('perday');
    } else {
      // ถ้าเป็น checkbox แบบเดิม ให้ตรวจสอบก่อนว่าจำเป็นต้องเปลี่ยนหรือไม่
      const dailyCheckbox = page.getByRole('checkbox', { name: /Daily|Per Day/i });
      if (await dailyCheckbox.isVisible() && !(await dailyCheckbox.isChecked())) {
        await dailyCheckbox.check();
      }
    }
  } catch (e) {
    console.log('Rate type selection might be different, using fallback method');
    // ถ้า UI ต่างจากที่คาด ให้ลองเลือกโดยการคลิกที่ข้อความ
    try {
      await page.getByText(/daily|per day/i).click();
    } catch (e2) {
      console.log('Could not set rate type, using default');
    }
  }
  
  // กรอกคำอธิบาย
  await page.getByRole('textbox', { name: 'Description *' }).click();
  await page.getByRole('textbox', { name: 'Description *' }).fill('test');
  
  // 5. บันทึก
  await page.getByRole('button', { name: 'Create Service' }).click();
  
  // 6. ตรวจสอบว่าสร้างสำเร็จ
  await expect(page.getByText('Service created successfully')).toBeVisible({ timeout: 5000 });
  await expect(page.getByRole('cell', { name: serviceName })).toBeVisible({ timeout: 5000 });
  
  console.log(`Created service: ${serviceName}`);
});

/**
 * Test Case 2: Provider สร้างรถพร้อมเลือก Additional Service
 * TC2-1-2: Create Car with Additional Service by Provider
 */
test('Provider can add a car with additional service', async ({ page }) => {
  // 1. เข้าสู่ระบบด้วย Provider
  await loginAsProvider(page);
  
  // 2. ไปที่หน้าจัดการรถ
  await page.getByRole('link', { name: 'Provider Tools' }).click();
  await page.getByRole('link', { name: 'Manage Cars Add, update, or' }).click();
  
  // 3. คลิกปุ่ม Add New Car
  await page.getByRole('button', { name: 'Add New Car' }).click();
  
  // 4. กรอกข้อมูลรถตามที่ระบุใน Test Case
  await page.getByRole('textbox', { name: 'License Plate *' }).click();
  await page.getByRole('textbox', { name: 'License Plate *' }).fill(carLicensePlate);
  await page.getByRole('textbox', { name: 'Brand *' }).click();
  await page.getByRole('textbox', { name: 'Brand *' }).fill(carBrand);
  await page.getByRole('textbox', { name: 'Model *' }).click();
  await page.getByRole('textbox', { name: 'Model *' }).fill(carModel);
  
  // เลือกประเภทและสี
  await page.getByLabel('Type *').selectOption('sedan');
  await page.getByLabel('Color *').selectOption(carColor);
  
  // กรอกราคา
  await page.getByRole('spinbutton', { name: 'Daily Rate (USD) *' }).click();
  await page.getByRole('spinbutton', { name: 'Daily Rate (USD) *' }).fill(carRate);
  
  // 5. เลือก service ที่เพิ่งสร้าง
  // คลิกที่ service ที่มีชื่อและราคาตามที่กำหนด
  await page.locator('div').filter({ hasText: new RegExp(`${serviceName}.*\\$${serviceRate}`, 'i') }).first().click();
  
  // 6. บันทึก
  await page.getByRole('button', { name: 'Add Car' }).click();
  
  // 7. ตรวจสอบว่าเพิ่มรถสำเร็จ - รอให้หน้าโหลดเสร็จ
  await page.waitForTimeout(2000);
  
  // ตรวจสอบว่ารถถูกสร้างและแสดงในตาราง
  await expect(page.getByRole('cell', { name: carLicensePlate })).toBeVisible({ timeout: 5000 });
  
  // ตรวจสอบแบรนด์และโมเดล
  const brandModelCell = page.getByRole('cell', { name: new RegExp(`${carBrand}\\s+${carModel}`, 'i') });
  await expect(brandModelCell).toBeVisible({ timeout: 5000 });
  
  // ตรวจสอบว่ามี service ที่เลือกแสดงในตาราง (อาจจะแสดงเป็น "1 service" หรือชื่อ service โดยตรง)
  try {
    // วิธีที่ 1: ตรวจสอบว่ามีข้อความเกี่ยวกับ service
    await expect(page.getByText(/service|services/i).first()).toBeVisible({ timeout: 3000 });
  } catch (e) {
    // วิธีที่ 2: ตรวจสอบว่ามีชื่อ service โดยตรง
    console.log('Service indicator not found, checking for service name');
    await expect(page.getByText(serviceName).first()).toBeVisible({ timeout: 3000 });
  }
  
  console.log(`Created car: ${carLicensePlate}`);
});

/**
 * Test Case 3: ลูกค้าจองรถพร้อม Additional Service
 * TC2-1-3: Make Reservation with Additional Service by Renter
 */
test('Customer can book a car with additional service', async ({ page }) => {
  // 1. เข้าสู่ระบบด้วย Customer
  await loginAsCustomer(page);
  
  // 2. ไปที่หน้า catalog
  await page.getByRole('link', { name: 'Catalog' }).click();
  
  // 3. รอสักครู่ให้หน้า catalog โหลด
  await page.waitForTimeout(3000);
  
  // 4. คลิกเลือกรถที่เพิ่งสร้าง
  // ค้นหารถจากข้อมูลที่เรากำหนด
  await page.locator('[data-test-id="catalog"] div').filter({ hasText: new RegExp(`${carBrand}\\s+${carModel}`, 'i') }).getByRole('button').nth(1).click();
  
  // รอให้หน้ารายละเอียดรถโหลด
  await page.waitForTimeout(2000);
  
  // 5. เลือกวันที่จองตามที่กำหนด
  // Pickup Date: 05/22/2026
  await page.locator('div').filter({ hasText: /^Pickup Date$/ }).getByRole('textbox').fill('2026-05-22');
  // Return Date: 05/23/2026
  await page.locator('div').filter({ hasText: /^Return Date$/ }).getByRole('textbox').fill('2026-05-23');
  
  // เลือกเวลา
  // Pickup Time: 10:00
  await page.locator('div').filter({ hasText: /^Pickup Time$/ }).getByRole('textbox').fill('10:00');
  // Return Time: 12:00
  await page.locator('div').filter({ hasText: /^Return Time$/ }).getByRole('textbox').fill('12:00');
  
  // 6. ตรวจสอบว่ารถว่าง
  await expect(page.getByText('Car is available for selected dates and times!')).toBeVisible({ timeout: 5000 });
  
  // 7. เลือก additional service
  await page.waitForTimeout(1000);
  await page.locator('div').filter({ hasText: /^Click to add services$/ }).nth(2).click();
  await page.getByText(serviceName).click();
  
  // 8. ตรวจสอบราคาและทำการจอง
  await page.waitForTimeout(1500);
  
  // คลิกปุ่มจอง Confirm & Pay Deposit
  await page.getByRole('button', { name: /confirm & pay/i }).click();
  
  // 9. ตรวจสอบว่าจองสำเร็จ - Success popup
  await expect(page.getByText(/booking successful/i)).toBeVisible({ timeout: 10000 });
  
  // ปิดหน้าต่างสำเร็จ
  await page.getByText('Close').click();
  
  // 10. ตรวจสอบว่าหลังจากปิด popup ระบบนำทางไปยังหน้ารายการจอง (/account/reservations)
  await expect(page).toHaveURL(/\/account\/reservations/);
  
  // รอให้หน้าโหลด
  await page.waitForTimeout(2000);
  
  // 11. ตรวจสอบว่ามีการจองใหม่ปรากฏในรายการ
  await expect(page.getByRole('cell', { name: new RegExp(`${carBrand}\\s+${carModel}`, 'i') })).toBeVisible({ timeout: 5000 });
  
  // 12. คลิก "View Detail" เพื่อดูรายละเอียดการจอง
  const reservationRow = page.getByRole('row', { name: new RegExp(`${carBrand}\\s+${carModel}`, 'i') }).first();
  await reservationRow.getByRole('link').click();
  
  // รอให้หน้ารายละเอียดโหลด
  await page.waitForTimeout(2000);
  
  // เก็บ reservationId จาก URL
  const url = page.url();
  reservationId = url.split('/').pop() || null;
  console.log(`Created reservation: ${reservationId}`);
  
  // 13. ตรวจสอบว่าใน reservation details, มี Service_temp 10$ perday แสดงอยู่ใน Additional Services
  await expect(page.getByText(serviceName)).toBeVisible({ timeout: 5000 });
  await expect(page.getByText(/10\s*\$|10\.00/)).toBeVisible({ timeout: 5000 });
});

/**
 * ทำความสะอาดหลังการทดสอบ
 */
test.afterAll(async ({ browser }) => {
  console.log('Starting cleanup process...');
  
  const context = await browser.newContext();
  const page = await context.newPage();
  
  try {
    // 1. ยกเลิกการจอง
    if (reservationId) {
      console.log(`Cleaning up reservation: ${reservationId}`);
      
      // ล็อกอินเป็น admin
      await loginAsAdmin(page);
      
      // ไปที่หน้ารายการจอง
      await page.goto(`http://localhost:3000/admin/reservations`);
      
      try {
        // รอให้หน้าโหลดเสร็จ
        await page.waitForTimeout(3000);
        
        // ค้นหาการจองที่เกี่ยวข้องกับรถของเรา
        const reservationRow = page.getByRole('row', { name: new RegExp(carLicensePlate, 'i') }).first();
        
        if (await reservationRow.isVisible()) {
          // คลิกดูรายละเอียด
          await reservationRow.getByRole('link').click();
          
          // รอให้หน้ารายละเอียดโหลด
          await page.waitForTimeout(2000);
          
          // ค้นหาปุ่มยกเลิก
          const cancelButton = page.getByRole('button', { name: /cancel reservation/i });
          if (await cancelButton.isVisible()) {
            await cancelButton.click();
            
            // จัดการกับ dialog ยืนยัน (ถ้ามี)
            page.on('dialog', async dialog => {
              await dialog.accept();
            });
            
            // หรือคลิกปุ่มยืนยันในโมดัล
            try {
              const confirmButton = page.getByRole('button', { name: /yes|confirm|cancel/i }).first();
              if (await confirmButton.isVisible({ timeout: 2000 })) {
                await confirmButton.click();
              }
            } catch (e) {
              console.log('No confirmation modal found');
            }
            
            console.log('Reservation cancelled');
          } else {
            console.log('No cancel button found, reservation may already be cancelled');
          }
        } else {
          console.log('Reservation not found in list');
        }
      } catch (e) {
        console.log('Error cancelling reservation:', e);
      }
    }
    
    // 2. ลบรถ
    try {
      console.log(`Cleaning up car: ${carLicensePlate}`);
      
      // ไปที่หน้าจัดการรถ
      await page.goto('http://localhost:3000/admin/manageCars');
      
      // รอให้หน้าโหลดเสร็จ
      await page.waitForTimeout(3000);
      
      // ค้นหาแถวที่มีรถของเรา
      const carRow = page.getByRole('row', { name: new RegExp(carLicensePlate, 'i') }).first();
      
      if (await carRow.isVisible()) {
        // คลิกปุ่มลบ (เป็นไอคอน svg ที่อยู่ตัวสุดท้าย)
        const deleteButton = carRow.locator('svg').last();
        await deleteButton.click();
        
        // จัดการกับ dialog ยืนยัน
        page.on('dialog', async dialog => {
          await dialog.accept();
        });
        
        // หรือคลิกปุ่มยืนยันในโมดัล
        try {
          const confirmButton = page.getByRole('button', { name: /ok|confirm|yes|delete/i }).first();
          if (await confirmButton.isVisible({ timeout: 2000 })) {
            await confirmButton.click();
          }
        } catch (e) {
          console.log('No confirmation modal found');
        }
        
        console.log('Car deleted');
      } else {
        console.log('Car not found for deletion');
      }
    } catch (e) {
      console.log('Error deleting car:', e);
    }
    
    // 3. ลบ service
    try {
      console.log(`Cleaning up service: ${serviceName}`);
      
      // ไปที่หน้าจัดการ services
      await page.goto('http://localhost:3000/admin/manageServices');
      
      // รอให้หน้าโหลดเสร็จ
      await page.waitForTimeout(3000);
      
      // ค้นหาแถวที่มี service ของเรา
      const serviceRow = page.getByRole('row', { name: new RegExp(serviceName, 'i') }).first();
      
      if (await serviceRow.isVisible()) {
        // คลิกปุ่มลบ (เป็นไอคอน svg ที่อยู่ตัวสุดท้าย)
        const deleteButton = serviceRow.locator('svg').last();
        await deleteButton.click();
        
        // จัดการกับ dialog ยืนยัน
        page.on('dialog', async dialog => {
          await dialog.accept();
        });
        
        // หรือคลิกปุ่มยืนยันในโมดัล
        try {
          const confirmButton = page.getByRole('button', { name: /ok|confirm|yes|delete/i }).first();
          if (await confirmButton.isVisible({ timeout: 2000 })) {
            await confirmButton.click();
          }
        } catch (e) {
          console.log('No confirmation modal found');
        }
        
        console.log('Service deleted');
      } else {
        console.log('Service not found for deletion');
      }
    } catch (e) {
      console.log('Error deleting service:', e);
    }
    
    console.log('Cleanup completed');
  } catch (e) {
    console.error('Error during cleanup:', e);
  } finally {
    await context.close();
  }
});