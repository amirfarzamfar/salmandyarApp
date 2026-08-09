// Tab Navigation
document.addEventListener('DOMContentLoaded', function () {
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');

    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const targetTab = btn.getAttribute('data-tab');

            // Remove active class from all tabs and contents
            tabBtns.forEach(b => b.classList.remove('active'));
            tabContents.forEach(c => c.classList.remove('active'));

            // Add active class to clicked tab and corresponding content
            btn.classList.add('active');
            document.getElementById(targetTab).classList.add('active');
        });
    });
});

// محاسبه دوز هپارین/انسولین
function calculateHeparin() {
    const dose = parseFloat(document.getElementById('heparin-dose').value);
    const drugTotal = parseFloat(document.getElementById('heparin-drug-total').value);
    const volume = parseFloat(document.getElementById('heparin-volume').value);

    if (!dose || !drugTotal || !volume) {
        showError('heparin-result', 'لطفاً تمام فیلدها را پر کنید');
        return;
    }

    if (dose <= 0 || drugTotal <= 0 || volume <= 0) {
        showError('heparin-result', 'مقادیر باید بزرگتر از صفر باشند');
        return;
    }

    // فرمول: (دوز × حجم) / مقدار کل دارو
    const infusionRate = (dose * volume) / drugTotal;

    const result = `
        <h3><i class="fas fa-check-circle"></i> نتیجه محاسبه</h3>
        <p><strong>سرعت انفوزیون:</strong> ${infusionRate.toFixed(2)} میلی‌لیتر در ساعت</p>
        <p><strong>دوز تجویز شده:</strong> ${dose} واحد/ساعت</p>
        <p><strong>مقدار کل دارو:</strong> ${drugTotal} واحد</p>
        <p><strong>حجم کل محلول:</strong> ${volume} میلی‌لیتر</p>
        <div class="formula">
            فرمول: (دوز × حجم) ÷ مقدار کل دارو = (${dose} × ${volume}) ÷ ${drugTotal} = ${infusionRate.toFixed(2)} میلی‌لیتر/ساعت
        </div>
    `;

    showResult('heparin-result', result);
}

// محاسبه دوز دوپامین/دبوتامین/میلرینون
function calculateDopamine() {
    const dose = parseFloat(document.getElementById('dopamine-dose').value);
    const weight = parseFloat(document.getElementById('dopamine-weight').value);
    const drugTotal = parseFloat(document.getElementById('dopamine-drug-total').value);
    const volume = parseFloat(document.getElementById('dopamine-volume').value);

    if (!dose || !weight || !drugTotal || !volume) {
        showError('dopamine-result', 'لطفاً تمام فیلدها را پر کنید');
        return;
    }

    if (dose <= 0 || weight <= 0 || drugTotal <= 0 || volume <= 0) {
        showError('dopamine-result', 'مقادیر باید بزرگتر از صفر باشند');
        return;
    }

    // فرمول: (دوز × وزن × 60) / (مقدار کل دارو / حجم × 1000)
    const concentration = drugTotal / volume;
    const infusionRate = (dose * weight * 60) / (concentration * 1000);

    const result = `
        <h3><i class="fas fa-check-circle"></i> نتیجه محاسبه</h3>
        <p><strong>سرعت انفوزیون:</strong> ${infusionRate.toFixed(2)} میلی‌لیتر در ساعت</p>
        <p><strong>دوز تجویز شده:</strong> ${dose} میکروگرم/کیلوگرم/دقیقه</p>
        <p><strong>وزن بیمار:</strong> ${weight} کیلوگرم</p>
        <p><strong>مقدار کل دارو:</strong> ${drugTotal} میلی‌گرم</p>
        <p><strong>حجم کل محلول:</strong> ${volume} میلی‌لیتر</p>
        <div class="formula">
            فرمول: (دوز × وزن × 60) ÷ (غلظت × 1000) = (${dose} × ${weight} × 60) ÷ (${concentration.toFixed(2)} × 1000) = ${infusionRate.toFixed(2)} میلی‌لیتر/ساعت
        </div>
    `;

    showResult('dopamine-result', result);
}

// محاسبه دوز اپی نفرین/نوراپی نفرین
function calculateEpinephrine() {
    const dose = parseFloat(document.getElementById('epi-dose').value);
    const drugTotal = parseFloat(document.getElementById('epi-drug-total').value);
    const volume = parseFloat(document.getElementById('epi-volume').value);

    if (!dose || !drugTotal || !volume) {
        showError('epi-result', 'لطفاً تمام فیلدها را پر کنید');
        return;
    }

    if (dose <= 0 || drugTotal <= 0 || volume <= 0) {
        showError('epi-result', 'مقادیر باید بزرگتر از صفر باشند');
        return;
    }

    // فرمول: (دوز × 60) / (مقدار کل دارو / حجم × 1000)
    const concentration = drugTotal / volume;
    const infusionRate = (dose * 60) / (concentration * 1000);

    const result = `
        <h3><i class="fas fa-check-circle"></i> نتیجه محاسبه</h3>
        <p><strong>سرعت انفوزیون:</strong> ${infusionRate.toFixed(2)} میلی‌لیتر در ساعت</p>
        <p><strong>دوز تجویز شده:</strong> ${dose} میکروگرم/دقیقه</p>
        <p><strong>مقدار کل دارو:</strong> ${drugTotal} میلی‌گرم</p>
        <p><strong>حجم کل محلول:</strong> ${volume} میلی‌لیتر</p>
        <div class="formula">
            فرمول: (دوز × 60) ÷ (غلظت × 1000) = (${dose} × 60) ÷ (${concentration.toFixed(2)} × 1000) = ${infusionRate.toFixed(2)} میلی‌لیتر/ساعت
        </div>
    `;

    showResult('epi-result', result);
}

// محاسبه دوز نیتروگلیسیرین
function calculateNitroglycerin() {
    const dose = parseFloat(document.getElementById('nitro-dose').value);
    const drugTotal = parseFloat(document.getElementById('nitro-drug-total').value);
    const volume = parseFloat(document.getElementById('nitro-volume').value);

    if (!dose || !drugTotal || !volume) {
        showError('nitro-result', 'لطفاً تمام فیلدها را پر کنید');
        return;
    }

    if (dose <= 0 || drugTotal <= 0 || volume <= 0) {
        showError('nitro-result', 'مقادیر باید بزرگتر از صفر باشند');
        return;
    }

    // فرمول: (دوز × 60) / (مقدار کل دارو / حجم × 1000)
    const concentration = drugTotal / volume;
    const infusionRate = (dose * 60) / (concentration * 1000);

    const result = `
        <h3><i class="fas fa-check-circle"></i> نتیجه محاسبه</h3>
        <p><strong>سرعت انفوزیون:</strong> ${infusionRate.toFixed(2)} میلی‌لیتر در ساعت</p>
        <p><strong>دوز تجویز شده:</strong> ${dose} میکروگرم/دقیقه</p>
        <p><strong>مقدار کل دارو:</strong> ${drugTotal} میلی‌گرم</p>
        <p><strong>حجم کل محلول:</strong> ${volume} میلی‌لیتر</p>
        <div class="formula">
            فرمول: (دوز × 60) ÷ (غلظت × 1000) = (${dose} × 60) ÷ (${concentration.toFixed(2)} × 1000) = ${infusionRate.toFixed(2)} میلی‌لیتر/ساعت
        </div>
    `;

    showResult('nitro-result', result);
}

// محاسبه دوز آمیودارون/لیدوکایین
function calculateAmiodarone() {
    const dose = parseFloat(document.getElementById('amio-dose').value);
    const drugTotal = parseFloat(document.getElementById('amio-drug-total').value);
    const volume = parseFloat(document.getElementById('amio-volume').value);

    if (!dose || !drugTotal || !volume) {
        showError('amio-result', 'لطفاً تمام فیلدها را پر کنید');
        return;
    }

    if (dose <= 0 || drugTotal <= 0 || volume <= 0) {
        showError('amio-result', 'مقادیر باید بزرگتر از صفر باشند');
        return;
    }

    // فرمول: (دوز × 60) / (مقدار کل دارو / حجم)
    const concentration = drugTotal / volume;
    const infusionRate = (dose * 60) / concentration;

    const result = `
        <h3><i class="fas fa-check-circle"></i> نتیجه محاسبه</h3>
        <p><strong>سرعت انفوزیون:</strong> ${infusionRate.toFixed(2)} میلی‌لیتر در ساعت</p>
        <p><strong>دوز تجویز شده:</strong> ${dose} میلی‌گرم/دقیقه</p>
        <p><strong>مقدار کل دارو:</strong> ${drugTotal} میلی‌گرم</p>
        <p><strong>حجم کل محلول:</strong> ${volume} میلی‌لیتر</p>
        <div class="formula">
            فرمول: (دوز × 60) ÷ غلظت = (${dose} × 60) ÷ ${concentration.toFixed(2)} = ${infusionRate.toFixed(2)} میلی‌لیتر/ساعت
        </div>
    `;

    showResult('amio-result', result);
}

// محاسبه دوز پنتاپرازول
function calculatePantoprazole() {
    const dose = parseFloat(document.getElementById('pantoprazole-dose').value);
    const drugTotal = parseFloat(document.getElementById('pantoprazole-drug-total').value);
    const volume = parseFloat(document.getElementById('pantoprazole-volume').value);

    if (!dose || !drugTotal || !volume) {
        showError('pantoprazole-result', 'لطفاً تمام فیلدها را پر کنید');
        return;
    }

    if (dose <= 0 || drugTotal <= 0 || volume <= 0) {
        showError('pantoprazole-result', 'مقادیر باید بزرگتر از صفر باشند');
        return;
    }

    // فرمول: (دوز × حجم) / مقدار کل دارو
    const infusionRate = (dose * volume) / drugTotal;
    const concentration = drugTotal / volume;

    const result = `
        <h3><i class="fas fa-check-circle"></i> نتیجه محاسبه</h3>
        <p><strong>سرعت انفوزیون:</strong> ${infusionRate.toFixed(2)} میلی‌لیتر در ساعت</p>
        <p><strong>دوز تجویز شده:</strong> ${dose} میلی‌گرم/ساعت</p>
        <p><strong>مقدار کل دارو:</strong> ${drugTotal} میلی‌گرم</p>
        <p><strong>حجم کل محلول:</strong> ${volume} میلی‌لیتر</p>
        <p><strong>غلظت محاسبه شده:</strong> ${concentration.toFixed(2)} میلی‌گرم/میلی‌لیتر</p>
        <div class="formula">
            فرمول: (دوز × حجم) ÷ مقدار کل دارو = (${dose} × ${volume}) ÷ ${drugTotal} = ${infusionRate.toFixed(2)} میلی‌لیتر/ساعت
        </div>
    `;

    showResult('pantoprazole-result', result);
}

// محاسبه دوز میدازولام
function calculateMidazolam() {
    const dose = parseFloat(document.getElementById('midazolam-dose').value);
    const drugTotal = parseFloat(document.getElementById('midazolam-drug-total').value);
    const volume = parseFloat(document.getElementById('midazolam-volume').value);
    const doseType = document.getElementById('midazolam-dose-type').value;

    if (!dose || !drugTotal || !volume) {
        showError('midazolam-result', 'لطفاً تمام فیلدها را پر کنید');
        return;
    }

    if (dose <= 0 || drugTotal <= 0 || volume <= 0) {
        showError('midazolam-result', 'مقادیر باید بزرگتر از صفر باشند');
        return;
    }

    // فرمول: (دوز × حجم) / مقدار کل دارو
    const infusionRate = (dose * volume) / drugTotal;

    let doseUnit = doseType === 'mg-per-hr' ? 'میلی‌گرم/ساعت' : 'میکروگرم/ساعت';
    let drugUnit = doseType === 'mg-per-hr' ? 'میلی‌گرم' : 'میکروگرم';

    const result = `
        <h3><i class="fas fa-check-circle"></i> نتیجه محاسبه</h3>
        <p><strong>سرعت انفوزیون:</strong> ${infusionRate.toFixed(2)} میلی‌لیتر در ساعت</p>
        <p><strong>دوز تجویز شده:</strong> ${dose} ${doseUnit}</p>
        <p><strong>مقدار کل دارو:</strong> ${drugTotal} ${drugUnit}</p>
        <p><strong>حجم کل محلول:</strong> ${volume} میلی‌لیتر</p>
        <div class="formula">
            فرمول: (دوز × حجم) ÷ مقدار کل دارو = (${dose} × ${volume}) ÷ ${drugTotal} = ${infusionRate.toFixed(2)} میلی‌لیتر/ساعت
        </div>
    `;

    showResult('midazolam-result', result);
}

// تغییر نوع دوز میدازولام
function toggleMidazolamDoseType() {
    const doseType = document.getElementById('midazolam-dose-type').value;
    const doseLabel = document.getElementById('midazolam-dose-label');
    const drugTotalLabel = document.getElementById('midazolam-drug-total-label');
    const doseInput = document.getElementById('midazolam-dose');

    if (doseType === 'mg-per-hr') {
        doseLabel.textContent = 'دوز تجویز شده (میلی‌گرم/ساعت):';
        drugTotalLabel.textContent = 'مقدار کل دارو (میلی‌گرم):';
        doseInput.placeholder = 'مثال: 5';
    } else {
        doseLabel.textContent = 'دوز تجویز شده (میکروگرم/ساعت):';
        drugTotalLabel.textContent = 'مقدار کل دارو (میکروگرم):';
        doseInput.placeholder = 'مثال: 5000';
    }
}

// محاسبه دوز فنتانیل
function calculateFentanyl() {
    const dose = parseFloat(document.getElementById('fentanyl-dose').value);
    const drugTotal = parseFloat(document.getElementById('fentanyl-drug-total').value);
    const volume = parseFloat(document.getElementById('fentanyl-volume').value);

    if (!dose || !drugTotal || !volume) {
        showError('fentanyl-result', 'لطفاً تمام فیلدها را پر کنید');
        return;
    }

    if (dose <= 0 || drugTotal <= 0 || volume <= 0) {
        showError('fentanyl-result', 'مقادیر باید بزرگتر از صفر باشند');
        return;
    }

    // فرمول: (دوز × حجم) / مقدار کل دارو
    const infusionRate = (dose * volume) / drugTotal;

    const result = `
        <h3><i class="fas fa-check-circle"></i> نتیجه محاسبه</h3>
        <p><strong>سرعت انفوزیون:</strong> ${infusionRate.toFixed(2)} میلی‌لیتر در ساعت</p>
        <p><strong>دوز تجویز شده:</strong> ${dose} میکروگرم/ساعت</p>
        <p><strong>مقدار کل دارو:</strong> ${drugTotal} میکروگرم</p>
        <p><strong>حجم کل محلول:</strong> ${volume} میلی‌لیتر</p>
        <div class="formula">
            فرمول: (دوز × حجم) ÷ مقدار کل دارو = (${dose} × ${volume}) ÷ ${drugTotal} = ${infusionRate.toFixed(2)} میلی‌لیتر/ساعت
        </div>
    `;

    showResult('fentanyl-result', result);
}

// محاسبه دوز اکتروتاید
function calculateOctreotide() {
    const dose = parseFloat(document.getElementById('octreotide-dose').value);
    const drugTotal = parseFloat(document.getElementById('octreotide-drug-total').value);
    const volume = parseFloat(document.getElementById('octreotide-volume').value);

    if (!dose || !drugTotal || !volume) {
        showError('octreotide-result', 'لطفاً تمام فیلدها را پر کنید');
        return;
    }

    if (dose <= 0 || drugTotal <= 0 || volume <= 0) {
        showError('octreotide-result', 'مقادیر باید بزرگتر از صفر باشند');
        return;
    }

    // فرمول: (دوز × حجم) / مقدار کل دارو
    const concentration = drugTotal / volume;
    const infusionRate = (dose * volume) / drugTotal;

    const result = `
        <h3><i class="fas fa-check-circle"></i> نتیجه محاسبه</h3>
        <p><strong>سرعت انفوزیون:</strong> ${infusionRate.toFixed(2)} میلی‌لیتر در ساعت</p>
        <p><strong>دوز تجویز شده:</strong> ${dose} میکروگرم/ساعت</p>
        <p><strong>مقدار کل دارو:</strong> ${drugTotal} میکروگرم</p>
        <p><strong>حجم کل محلول:</strong> ${volume} میلی‌لیتر</p>
        <div class="formula">
            فرمول: (دوز × حجم) ÷ مقدار کل دارو = (${dose} × ${volume}) ÷ ${drugTotal} = ${infusionRate.toFixed(2)} میلی‌لیتر/ساعت
        </div>
    `;

    showResult('octreotide-result', result);
}

// --- New Drug Calculation Feature ---

function toggleWeightInput() {
    const unit = document.getElementById('prescribedDoseUnit').value;
    const weightInput = document.getElementById('weightInput');
    if (unit.includes('kg')) {
        weightInput.style.display = 'block';
    } else {
        weightInput.style.display = 'none';
        document.getElementById('weight').value = ''; // Clear weight if hidden
    }
}

function calculateGeneralDrug() {
    const drugDose = parseFloat(document.getElementById('drugDose').value);
    const drugDoseUnit = document.getElementById('drugDoseUnit').value;
    const syringeVolume = parseFloat(document.getElementById('syringeVolume').value);
    const prescribedDose = parseFloat(document.getElementById('prescribedDose').value);
    const prescribedDoseUnit = document.getElementById('prescribedDoseUnit').value;
    const weight = parseFloat(document.getElementById('weight').value);
    const infusionMethod = document.querySelector('input[name="infusionMethod"]:checked').value;

    const resultDiv = document.getElementById('drugResult');

    // Validation
    if (!drugDose || !syringeVolume || !prescribedDose) {
        showError('drugResult', 'لطفاً تمام فیلدها را پر کنید');
        return;
    }

    if (prescribedDoseUnit.includes('kg') && !weight) {
        showError('drugResult', 'لطفاً وزن بیمار را وارد کنید');
        return;
    }

    // 1. Normalize Total Drug Amount to Base Unit (mcg or U)
    let totalDrugBase = drugDose;
    let isUnit = false;

    if (drugDoseUnit === 'U') {
        isUnit = true;
    } else {
        // Mass: convert to mcg
        if (drugDoseUnit === 'g') totalDrugBase *= 1000000;
        else if (drugDoseUnit === 'mg') totalDrugBase *= 1000;
        // mcg is already mcg
    }

    // 2. Check Unit Compatibility
    const prescribedNumerator = prescribedDoseUnit.split('/')[0]; // mg, mcg, U
    if (prescribedNumerator === 'U' && !isUnit) {
        showError('drugResult', 'خطا: واحد دارو جرمی است اما دوز تجویزی بر اساس واحد (Unit) است.');
        return;
    }
    if (prescribedNumerator !== 'U' && isUnit) {
        showError('drugResult', 'خطا: واحد دارو Unit است اما دوز تجویزی جرمی است.');
        return;
    }

    // 3. Calculate Target Amount Per Hour in Base Unit
    let targetAmountPerHour = prescribedDose;

    // Time conversion
    if (prescribedDoseUnit.includes('min')) {
        targetAmountPerHour *= 60;
    }

    // Weight conversion
    if (prescribedDoseUnit.includes('kg')) {
        targetAmountPerHour *= weight;
    }

    // Unit conversion to Base (mcg or U)
    if (prescribedNumerator === 'mg') targetAmountPerHour *= 1000;
    else if (prescribedNumerator === 'g') targetAmountPerHour *= 1000000;
    // mcg and U are base

    // 4. Calculate Concentration (Base Unit / ml)
    const concentration = totalDrugBase / syringeVolume;

    // 5. Calculate Rate (ml/h)
    const rateMlPerHr = targetAmountPerHour / concentration;

    // 6. Format Result
    let finalRate = rateMlPerHr;
    let unitLabel = 'میلی‌لیتر در ساعت';

    if (infusionMethod === 'microset') {
        // Assuming 60 drops/ml for microset
        // drops/min = ml/h
        finalRate = rateMlPerHr;
        unitLabel = 'قطره در دقیقه (میکروست)';
    }

    // Label Info
    const drugName = document.getElementById('drugName').value || '---';
    const nurseName = document.getElementById('nurseName').value || '---';
    const patientName = document.getElementById('patientName').value || '---';

    const resultHtml = `
        <h3><i class="fas fa-check-circle"></i> نتیجه محاسبه</h3>
        <div style="background: #e8f5e9; padding: 15px; border-radius: 10px; border: 1px solid #c8e6c9; margin-bottom: 15px;">
            <p style="font-size: 1.2rem; color: #2e7d32; font-weight: bold;">
                سرعت تزریق: ${finalRate.toFixed(2)} ${unitLabel}
            </p>
        </div>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; font-size: 0.95rem;">
            <p><strong>دوز تجویزی:</strong> ${prescribedDose} ${prescribedDoseUnit}</p>
            <p><strong>حجم کل:</strong> ${syringeVolume} میلی‌لیتر</p>
            <p><strong>مقدار دارو:</strong> ${drugDose} ${drugDoseUnit}</p>
            ${weight ? `<p><strong>وزن بیمار:</strong> ${weight} کیلوگرم</p>` : ''}
            <p><strong>غلظت:</strong> ${(concentration).toFixed(2)} ${isUnit ? 'Unit' : 'mcg'}/ml</p>
        </div>
        
        <div class="print-info" style="margin-top: 15px; border-top: 1px dashed #ccc; padding-top: 10px;">
            <p><strong>نام دارو:</strong> ${drugName}</p>
            <p><strong>بیمار:</strong> ${patientName}</p>
            <p><strong>پرستار:</strong> ${nurseName}</p>
        </div>
    `;

    showResult('drugResult', resultHtml);
}

// محاسبات داروهای درصدی
function calculatePercentageDrug() {
    const percentage = parseFloat(document.getElementById('drugPercentage').value);
    const requiredDose = parseFloat(document.getElementById('requiredDose').value);
    const requiredDoseUnit = document.getElementById('requiredDoseUnit').value;

    if (!percentage || !requiredDose) {
        showError('percentageDrugResult', 'لطفاً تمام فیلدها را پر کنید');
        return;
    }

    if (percentage <= 0 || requiredDose <= 0) {
        showError('percentageDrugResult', 'مقادیر باید بزرگتر از صفر باشند');
        return;
    }

    // 1. Calculate Concentration (mg/ml)
    // 1% = 1g/100ml = 1000mg/100ml = 10mg/ml
    // Formula: Concentration (mg/ml) = Percentage * 10
    const concentrationMgPerMl = percentage * 10;

    // 2. Convert Required Dose to mg
    let requiredDoseMg = requiredDose;
    if (requiredDoseUnit === 'g') {
        requiredDoseMg = requiredDose * 1000;
    }

    // 3. Calculate Volume Needed (ml)
    // Volume = Required Dose (mg) / Concentration (mg/ml)
    const volumeNeeded = requiredDoseMg / concentrationMgPerMl;

    const resultHtml = `
        <h3><i class="fas fa-check-circle"></i> نتیجه محاسبه</h3>
        <div style="background: #e3f2fd; padding: 15px; border-radius: 10px; border: 1px solid #bbdefb; margin-bottom: 15px;">
            <p style="font-size: 1.2rem; color: #1565c0; font-weight: bold;">
                حجم مورد نیاز: ${volumeNeeded.toFixed(2)} میلی‌لیتر
            </p>
        </div>
        <div style="font-size: 0.95rem;">
            <p><strong>درصد دارو:</strong> ${percentage}٪</p>
            <p><strong>غلظت محاسبه شده:</strong> ${concentrationMgPerMl} میلی‌گرم در میلی‌لیتر</p>
            <p><strong>دوز مورد نیاز:</strong> ${requiredDose} ${requiredDoseUnit === 'g' ? 'گرم' : 'میلی‌گرم'}</p>
        </div>
        <div class="formula">
            فرمول: حجم (ml) = دوز مورد نیاز (mg) ÷ (درصد × 10)
            <br>
            ${volumeNeeded.toFixed(2)} = ${requiredDoseMg} ÷ (${percentage} × 10)
        </div>
    `;

    showResult('percentageDrugResult', resultHtml);
}

// محاسبه قطرات سرم
function calculateSerumDrops() {
    const volume = parseFloat(document.getElementById('serum-volume').value);
    const hours = parseFloat(document.getElementById('serum-hours').value);
    const dropFactor = 15; // Fixed as per request

    if (!volume || !hours) {
        showError('serum-result', 'لطفاً تمام فیلدها را پر کنید');
        return;
    }

    if (volume <= 0 || hours <= 0) {
        showError('serum-result', 'مقادیر باید بزرگتر از صفر باشند');
        return;
    }

    // Formula: (Volume * DropFactor) / (Hours * 60)
    const minutes = hours * 60;
    const dropsPerMinute = (volume * dropFactor) / minutes;

    const resultHtml = `
        <h3><i class="fas fa-check-circle"></i> نتیجه محاسبه</h3>
        <div style="background: #e3f2fd; padding: 15px; border-radius: 10px; border: 1px solid #bbdefb; margin-bottom: 15px;">
            <p style="font-size: 1.2rem; color: #1565c0; font-weight: bold;">
                سرعت انفوزیون: ${Math.round(dropsPerMinute)} قطره در دقیقه
            </p>
            <p style="font-size: 0.9rem; color: #555; margin-top: 5px;">
                (${dropsPerMinute.toFixed(2)} دقیق)
            </p>
        </div>
        <div style="font-size: 0.95rem;">
            <p><strong>حجم کل:</strong> ${volume} میلی‌لیتر</p>
            <p><strong>مدت زمان:</strong> ${hours} ساعت (${minutes} دقیقه)</p>
            <p><strong>فاکتور قطره:</strong> ${dropFactor} قطره/میلی‌لیتر</p>
        </div>
        <div class="formula">
            فرمول: (حجم × ۱۵) ÷ (ساعت × ۶۰)
            <br>
            (${volume} × ۱۵) ÷ ${minutes} = ${dropsPerMinute.toFixed(2)}
        </div>
    `;

    showResult('serum-result', resultHtml);
}

// تبدیل واحدهای وزن
function convertUnits() {
    const value = parseFloat(document.getElementById('converter-value').value);
    const fromUnit = document.getElementById('converter-from').value;
    const toUnit = document.getElementById('converter-to').value;

    if (!value || value <= 0) {
        showError('converter-result', 'لطفاً مقدار معتبر وارد کنید');
        return;
    }

    if (fromUnit === toUnit) {
        showError('converter-result', 'واحد مبدا و مقصد یکسان است');
        return;
    }

    // تبدیل به میکروگرم (واحد پایه)
    let valueInMcg = value;
    switch (fromUnit) {
        case 'mg':
            valueInMcg = value * 1000;
            break;
        case 'g':
            valueInMcg = value * 1000000;
            break;
        case 'kg':
            valueInMcg = value * 1000000000;
            break;
        case 'mcg':
            valueInMcg = value;
            break;
    }

    // تبدیل از میکروگرم به واحد مقصد
    let result = valueInMcg;
    let resultUnit = 'میکروگرم';

    switch (toUnit) {
        case 'mg':
            result = valueInMcg / 1000;
            resultUnit = 'میلی‌گرم';
            break;
        case 'g':
            result = valueInMcg / 1000000;
            resultUnit = 'گرم';
            break;
        case 'kg':
            result = valueInMcg / 1000000000;
            resultUnit = 'کیلوگرم';
            break;
        case 'mcg':
            result = valueInMcg;
            resultUnit = 'میکروگرم';
            break;
    }

    const resultText = `
        <h3><i class="fas fa-check-circle"></i> نتیجه تبدیل</h3>
        <p><strong>${value} ${getUnitName(fromUnit)} = ${result.toFixed(6)} ${resultUnit}</strong></p>
        <p><strong>واحد مبدا:</strong> ${getUnitName(fromUnit)}</p>
        <p><strong>واحد مقصد:</strong> ${resultUnit}</p>
        <div class="formula">
            ${value} ${getUnitName(fromUnit)} = ${result.toFixed(6)} ${resultUnit}
        </div>
    `;

    showResult('converter-result', resultText);
}

// Helper Functions
function getUnitName(unit) {
    const names = {
        'mg': 'میلی‌گرم',
        'g': 'گرم',
        'kg': 'کیلوگرم',
        'mcg': 'میکروگرم'
    };
    return names[unit] || unit;
}

function showResult(elementId, content) {
    const element = document.getElementById(elementId);
    element.innerHTML = content;
    element.classList.add('show');
    element.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function showError(elementId, message) {
    const element = document.getElementById(elementId);
    element.innerHTML = `
        <h3><i class="fas fa-exclamation-triangle"></i> خطا</h3>
        <p style="color: #e74c3c; font-weight: 500;">${message}</p>
    `;
    element.classList.add('show');
    element.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

// Clear form function
function clearForm(formId) {
    const form = document.getElementById(formId);
    if (form) {
        const inputs = form.querySelectorAll('input, select');
        inputs.forEach(input => {
            if (input.type === 'number') {
                input.value = '';
            }
        });
    }
}

// Keyboard shortcuts
document.addEventListener('keydown', function (e) {
    // Ctrl + Enter to calculate
    if (e.ctrlKey && e.key === 'Enter') {
        const activeTab = document.querySelector('.tab-content.active');
        if (activeTab) {
            const calculateBtn = activeTab.querySelector('.calculate-btn');
            if (calculateBtn) {
                calculateBtn.click();
            }
        }
    }

    // Escape to clear form
    if (e.key === 'Escape') {
        const activeTab = document.querySelector('.tab-content.active');
        if (activeTab) {
            const inputs = activeTab.querySelectorAll('input[type="number"]');
            inputs.forEach(input => input.value = '');
            const result = activeTab.querySelector('.result');
            if (result) {
                result.classList.remove('show');
            }
        }
    }
});

// Auto-save form data to localStorage
function saveFormData() {
    const forms = document.querySelectorAll('.tab-content');
    forms.forEach(form => {
        const inputs = form.querySelectorAll('input, select');
        inputs.forEach(input => {
            input.addEventListener('input', function () {
                const formId = form.id;
                const inputId = input.id;
                const value = input.value;

                if (value) {
                    localStorage.setItem(`${formId}_${inputId}`, value);
                } else {
                    localStorage.removeItem(`${formId}_${inputId}`);
                }
            });
        });
    });
}

// Load saved form data
function loadFormData() {
    const forms = document.querySelectorAll('.tab-content');
    forms.forEach(form => {
        const inputs = form.querySelectorAll('input, select');
        inputs.forEach(input => {
            const formId = form.id;
            const inputId = input.id;
            const savedValue = localStorage.getItem(`${formId}_${inputId}`);

            if (savedValue) {
                input.value = savedValue;
            }
        });
    });
}

// Initialize auto-save and load
document.addEventListener('DOMContentLoaded', function () {
    saveFormData();
    loadFormData();
});

// Print function
function printResults() {
    window.print();
}

// Add print button to each result
document.addEventListener('DOMContentLoaded', function () {
    const results = document.querySelectorAll('.result');
    results.forEach(result => {
        const printBtn = document.createElement('button');
        printBtn.innerHTML = '<i class="fas fa-print"></i> چاپ';
        printBtn.className = 'print-btn';
        printBtn.style.cssText = `
            background: #27ae60;
            color: white;
            border: none;
            padding: 8px 15px;
            border-radius: 5px;
            cursor: pointer;
            margin-top: 10px;
            font-family: 'Vazirmatn', sans-serif;
            font-size: 0.9rem;
        `;
        printBtn.onclick = printResults;

        // Add print button when result is shown
        const observer = new MutationObserver(function (mutations) {
            mutations.forEach(function (mutation) {
                if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
                    if (result.classList.contains('show') && !result.querySelector('.print-btn')) {
                        result.appendChild(printBtn);
                    }
                }
            });
        });

        observer.observe(result, { attributes: true });
    });
});
