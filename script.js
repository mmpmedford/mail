document.getElementById('calculate').addEventListener('click', calculateTime);
document.getElementById('reset').addEventListener('click', resetForm);

// Add commas to the input field as the user types
document.getElementById('pieces').addEventListener('input', function(e) {
    let value = e.target.value.replace(/,/g, ''); 
    if (value && !isNaN(value)) {
        e.target.value = parseInt(value).toLocaleString('en-US');
    } else {
        e.target.value = value;
    }
});

function formatTime(minutes) {
    const hours = Math.floor(minutes / 60);
    const mins = Math.round(minutes % 60);
    if (hours > 0) {
        return `${hours} hr${hours > 1 ? 's' : ''} ${mins} min${mins !== 1 ? 's' : ''}`;
    }
    return `${mins} min${mins !== 1 ? 's' : ''}`;
}

function formatCurrency(amount) {
    return `$${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function resetForm() {
    document.getElementById('pieces').value = '1,000';
    document.getElementById('processingList').checked = false;
    document.getElementById('envelopeType').value = 'none';
    document.getElementById('inserts').value = '0';
    document.getElementById('insertMethod').value = 'none';
    document.getElementById('addressing').value = 'no';
    document.getElementById('sealingMethod').value = 'none';
    document.getElementById('stamps').value = 'no';
    document.getElementById('tabbing').value = 'no';
    document.getElementById('mailType').value = 'standard';
    document.getElementById('centerSheet').checked = false;
    document.getElementById('loadingTransport').checked = false;
    document.getElementById('results').innerHTML = '';
    document.getElementById('postage-costs').innerHTML = '';
}

function calculateTime() {
    const pieces = parseInt(document.getElementById('pieces').value.replace(/,/g, '')) || 0;
    const factor = pieces / 1000;
    let breakdown = [];
    let totalMin = 0;

    if (document.getElementById('processingList').checked) {
        totalMin += 20;
        breakdown.push(`Processing List: ${formatTime(20)}`);
    }

    const envelopeType = document.getElementById('envelopeType').value;
    if (envelopeType === '10') {
        totalMin += 30 * factor;
        breakdown.push(`Opening Envelopes (#10): ${formatTime(30 * factor)}`);
    } else if (envelopeType === 'A7') {
        totalMin += 45 * factor;
        breakdown.push(`Opening Envelopes (A7): ${formatTime(45 * factor)}`);
    }

    const inserts = parseInt(document.getElementById('inserts').value);
    const insertMethod = document.getElementById('insertMethod').value;
    if (inserts !== 0 && insertMethod !== 'none') {
        let insertTimePer1000 = (insertMethod === 'manual') 
            ? (inserts === 1 ? 60 : inserts === 2 ? 90 : 120) 
            : (inserts === 1 ? 15 : inserts === 2 ? 30 : 45);
        totalMin += insertTimePer1000 * factor;
        breakdown.push(`Inserting (${inserts} Inserts, ${insertMethod}): ${formatTime(insertTimePer1000 * factor)}`);
    }

    if (document.getElementById('addressing').value === 'yes') {
        totalMin += 20 * factor;
        breakdown.push(`Addressing Mail: ${formatTime(20 * factor)}`);
    }

    const sealingMethod = document.getElementById('sealingMethod').value;
    if (sealingMethod === 'manual') {
        totalMin += 60 * factor;
        breakdown.push(`Sealing (Manual): ${formatTime(60 * factor)}`);
    } else if (sealingMethod === 'automated') {
        totalMin += 20 * factor;
        breakdown.push(`Sealing (Automated): ${formatTime(20 * factor)}`);
    }

    if (document.getElementById('stamps').value === 'yes') {
        totalMin += 20 * factor;
        breakdown.push(`Applying Stamps: ${formatTime(20 * factor)}`);
    }

    if (document.getElementById('tabbing').value === 'yes') {
        totalMin += 20 * factor;
        breakdown.push(`Tabbing: ${formatTime(20 * factor)}`);
    }

    const mailType = document.getElementById('mailType').value;
    if (mailType === 'eddm') {
        totalMin += 15 * factor;
        breakdown.push(`EDDM Preparation: ${formatTime(15 * factor)}`);
    } else if (mailType === 'eddm_strap') {
        totalMin += 10 * factor;
        breakdown.push(`EDDM Preparation (1 Strap Done): ${formatTime(10 * factor)}`);
    }

    const trays = Math.ceil(pieces / 400);
    const labelTime = (trays / 5) * 2;
    if (labelTime > 0) {
        totalMin += labelTime;
        breakdown.push(`Labeling Trays (~${trays} trays): ${formatTime(labelTime)}`);
    }

    if (document.getElementById('centerSheet').checked) {
        totalMin += 5 * factor;
        breakdown.push(`Insert Center/Facing Sheet: ${formatTime(5 * factor)}`);
    }

    if (document.getElementById('loadingTransport').checked) {
        totalMin += 30;
        breakdown.push(`Loading/Transport: ${formatTime(30)}`);
    }

    const hours = Math.floor(totalMin / 60);
    const minutes = Math.round(totalMin % 60);

    const postageRates = [
        { type: 'Standard (Profit)', min: 0.33, max: 0.37 },
        { type: 'Standard (Non-Profit)', min: 0.16, max: 0.20 },
        { type: 'First Class (Stamps)', min: 0.78, max: 0.78 },
        { type: 'EDDM (Profit)', min: 0.25, max: 0.29 }
    ];

    const postageHtml = postageRates.map(cost => `
        <p><strong>${cost.type}:</strong> ${formatCurrency(pieces * cost.min)} - ${formatCurrency(pieces * cost.max)}</p>
    `).join('');

    document.getElementById('results').innerHTML = `
        <p class="total">Estimated Total Time: ${hours} hours and ${minutes} minutes</p>
        <div class="breakdown">
            <p>Breakdown:</p>
            <ul>${breakdown.map(item => `<li>${item}</li>`).join('')}</ul>
        </div>
    `;

    document.getElementById('postage-costs').innerHTML = `
        <p><strong>Estimated Postage Costs:</strong></p>
        ${postageHtml}
    `;
}
