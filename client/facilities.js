async function loadFacilities(forAdmin = false) {
    const facilitiesDiv = document.getElementById('facilities');
    if (!facilitiesDiv) {
        console.error('Facilities div not found');
        return;
    }
    facilitiesDiv.innerHTML = '<div class="loading">Loading facilities...</div>';
    try {
        const response = await fetch('/api/facilities', { credentials: 'include' });
        if (!response.ok) {
            console.error(`Failed to fetch facilities: ${response.status}`);
            facilitiesDiv.innerHTML = `<p>Failed to load facilities (Status: ${response.status}).</p>`;
            return;
        }
        const facilities = await response.json();
        facilitiesDiv.innerHTML = facilities.length ? facilities.map((facility, index) => `
            <div class="facility-card ${index % 2 === 0 ? 'image-left' : 'image-right'}">
                <img src="${facility.image || 'https://via.placeholder.com/300'}" alt="${facility.name || 'Facility'}">
                <div class="facility-content">
                    <h3>${escapeHtml(facility.name || 'Unnamed Facility')}</h3>
                    <p>${escapeHtml(facility.description || 'No description available')}</p>
                    ${forAdmin ? `
                        <button onclick="editFacility(${facility.id}, '${encodeURIComponent(facility.name || '')}', '${encodeURIComponent(facility.description || '')}', '${encodeURIComponent(facility.image || '')}')">Edit</button>
                        <button onclick="deleteFacility(${facility.id})">Delete</button>
                    ` : ''}
                </div>
            </div>
        `).join('') : '<p>No facilities available.</p>';
    } catch (error) {
        console.error('Error loading facilities:', error);
        facilitiesDiv.innerHTML = '<p>Failed to load facilities.</p>';
    }
}

async function handleFacilityManagement() {
    const form = document.getElementById('admin-facility-form');
    if (!form) {
        console.error('Facility form not found');
        return;
    }
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const name = document.getElementById('facility-name')?.value;
        const description = document.getElementById('facility-description')?.value;
        const image = document.getElementById('facility-image')?.value;
        if (!name) {
            alert('Facility name is required');
            return;
        }
        try {
            const response = await fetch('/api/facilities', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, description, image }),
                credentials: 'include'
            });
            if (response.ok) {
                loadFacilities(true);
                form.reset();
                alert('Facility added successfully');
            } else {
                const errorText = await response.text();
                alert(errorText || 'Failed to add facility');
            }
        } catch (error) {
            console.error('Error adding facility:', error);
            alert('Network error, please try again');
        }
    });
}

async function handleFacilityEdit() {
    const form = document.getElementById('edit-facility-form');
    if (!form) {
        console.error('Edit facility form not found');
        return;
    }
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const id = document.getElementById('edit-facility-id')?.value;
        const name = document.getElementById('edit-facility-name')?.value;
        const description = document.getElementById('edit-facility-description')?.value;
        const image = document.getElementById('edit-facility-image')?.value;
        if (!id || !name) {
            alert('Facility ID and name are required');
            return;
        }
        try {
            const response = await fetch(`/api/facilities/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, description, image }),
                credentials: 'include'
            });
            if (response.ok) {
                loadFacilities(true);
                form.style.display = 'none';
                alert('Facility updated successfully');
            } else {
                const errorText = await response.text();
                alert(errorText || 'Failed to update facility');
            }
        } catch (error) {
            console.error('Error updating facility:', error);
            alert('Network error, please try again');
        }
    });
}

function editFacility(id, name, description, image) {
    const editForm = document.getElementById('edit-facility-form');
    if (!editForm) {
        console.error('Edit facility form not found');
        return;
    }
    const idInput = document.getElementById('edit-facility-id');
    const nameInput = document.getElementById('edit-facility-name');
    const descInput = document.getElementById('edit-facility-description');
    const imageInput = document.getElementById('edit-facility-image');
    if (idInput && nameInput && descInput && imageInput) {
        idInput.value = id;
        nameInput.value = decodeURIComponent(name);
        descInput.value = decodeURIComponent(description);
        imageInput.value = decodeURIComponent(image);
        editForm.style.display = 'block';
    }
}

function cancelFacilityEdit() {
    const editForm = document.getElementById('edit-facility-form');
    if (editForm) {
        editForm.style.display = 'none';
    }
}

async function deleteFacility(id) {
    if (confirm('Are you sure you want to delete this facility?')) {
        try {
            const response = await fetch(`/api/facilities/${id}`, {
                method: 'DELETE',
                credentials: 'include'
            });
            if (response.ok) {
                loadFacilities(true);
                alert('Facility deleted successfully');
            } else {
                const errorText = await response.text();
                alert(errorText || 'Failed to delete facility');
            }
        } catch (error) {
            console.error('Error deleting facility:', error);
            alert('Network error, please try again');
        }
    }
}

function escapeHtml(text) {
    if (text == null) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}