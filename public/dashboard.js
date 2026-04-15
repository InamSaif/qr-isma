// API Base URL
const API_BASE = window.location.origin;

// Check authentication
function checkAuth() {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = '/login';
        return false;
    }
    return true;
}

// Get headers with auth token
function getHeaders() {
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
    };
}

// Initialize dashboard
document.addEventListener('DOMContentLoaded', async () => {
    if (!checkAuth()) return;
    
    // Load user info
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    document.getElementById('userName').textContent = user.name || 'User';
    
    // Load documents
    await loadDocuments();
});

// Load all documents
async function loadDocuments() {
    try {
        const response = await fetch(`${API_BASE}/api/documents`, {
            headers: getHeaders(),
            credentials: 'include'
        });

        const data = await response.json();

        if (!response.ok || !data.success) {
            throw new Error(data.error || 'Failed to load documents');
        }

        displayDocuments(data.documents);
        updateStats(data.documents);
    } catch (error) {
        console.error('Error loading documents:', error);
        showError('Failed to load documents: ' + error.message);
    }
}

// Display documents in table
function displayDocuments(documents) {
    const container = document.getElementById('documentsContainer');
    
    if (!documents || documents.length === 0) {
        container.innerHTML = `
            <div class="text-center py-12">
                <svg class="w-16 h-16 mx-auto text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                </svg>
                <p class="mt-4 text-gray-600">No documents yet</p>
                <p class="text-sm text-gray-500">Create your first port clearance document</p>
                <button onclick="showCreateForm()" class="mt-4 text-primary hover:text-secondary font-medium">Create Document</button>
            </div>
        `;
        return;
    }

    const table = `
        <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
                <tr>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Serial No.</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vessel Name</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Expires</th>
                    <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
                ${documents.map(doc => `
                    <tr>
                        <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">${doc.serialNo}</td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${doc.formData?.VESSEL_NAME || '-'}</td>
                        <td class="px-6 py-4 whitespace-nowrap">
                            <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                doc.status === 'active' ? 'bg-green-100 text-green-800' : 
                                doc.status === 'expired' ? 'bg-yellow-100 text-yellow-800' : 
                                'bg-red-100 text-red-800'
                            }">
                                ${doc.status}
                            </span>
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${new Date(doc.createdAt).toLocaleDateString()}</td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${doc.expiresAt ? new Date(doc.expiresAt).toLocaleDateString() : 'Never'}</td>
                        <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                            <button onclick="viewDocument('${doc._id}')" class="text-blue-600 hover:text-blue-900">View</button>
                            <button onclick="editDocument('${doc._id}')" class="text-primary hover:text-secondary">Edit</button>
                            ${doc.status === 'active' ? `<button onclick="expireDocument('${doc._id}')" class="text-yellow-600 hover:text-yellow-900">Expire</button>` : ''}
                            <button onclick="deleteDocument('${doc._id}')" class="text-red-600 hover:text-red-900">Delete</button>
                        </td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
    
    container.innerHTML = table;
}

// Update stats
function updateStats(documents) {
    const active = documents.filter(d => d.status === 'active').length;
    const expired = documents.filter(d => d.status === 'expired').length;
    const total = documents.length;
    
    document.getElementById('activeCount').textContent = active;
    document.getElementById('expiredCount').textContent = expired;
    document.getElementById('totalCount').textContent = total;
}

// Show create form
function showCreateForm() {
    document.getElementById('modalTitle').textContent = 'Create New Document';
    document.getElementById('btnText').textContent = 'Create Document';
    document.getElementById('documentId').value = '';
    document.getElementById('documentForm').reset();
    document.getElementById('documentModal').classList.remove('hidden');
}

// Close modal
function closeModal() {
    document.getElementById('documentModal').classList.add('hidden');
    document.getElementById('documentForm').reset();
}

// Handle form submission
document.getElementById('documentForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const docId = document.getElementById('documentId').value;
    const submitBtn = document.getElementById('submitBtn');
    const originalText = document.getElementById('btnText').textContent;
    
    submitBtn.disabled = true;
    document.getElementById('btnText').textContent = 'Processing...';
    
    try {
        const formData = {};
        const fields = [
            'SERIAL_NO', 'SERIAL_NO_FA', 'MARINE_AFFAIRS_NO', 'MARINE_AFFAIRS_NO_FA',
            'ISSUE_DATE_TIME', 'ISSUE_DATE_TIME_FA', 'PORT_CLEARANCE_NO', 'PORT_CLEARANCE_NO_FA',
            'CUSTOM_LEAVE_NO', 'CUSTOM_LEAVE_NO_FA', 'AGENT', 'AGENT_FA',
            'VESSEL_NAME', 'VESSEL_NAME_FA', 'ARRIVED_FROM', 'ARRIVED_FROM_FA',
            'ON_DATE', 'ON_DATE_FA', 'IMO_NO', 'IMO_NO_FA',
            'SHIPS_FLAG', 'SHIPS_FLAG_FA', 'REGISTRY_PORT', 'REGISTRY_PORT_FA',
            'GROSS_TONNAGE', 'GROSS_TONNAGE_FA', 'MASTER', 'MASTER_FA',
            'PERMITTED_TO_SAIL', 'PERMITTED_TO_SAIL_FA', 'HEAD_OF_MARITIME', 'HEAD_OF_MARITIME_FA',
            'PORT', 'PORT_FA'
        ];
        
        fields.forEach(field => {
            const value = document.getElementById(field).value.trim();
            if (value) formData[field] = value;
        });
        
        const expiresAt = document.getElementById('expiresAt').value;
        if (expiresAt) formData.expiresAt = new Date(expiresAt).toISOString();

        const isSignedCheckbox = document.getElementById('isSigned');
        formData.isSigned = isSignedCheckbox.checked;
        
        const url = docId ? `${API_BASE}/api/documents/${docId}` : `${API_BASE}/api/documents`;
        const method = docId ? 'PUT' : 'POST';
        
        const response = await fetch(url, {
            method,
            headers: getHeaders(),
            body: JSON.stringify(formData),
            credentials: 'include'
        });
        
        const data = await response.json();
        
        if (!response.ok || !data.success) {
            throw new Error(data.error || 'Failed to save document');
        }
        
        showSuccess(docId ? 'Document updated successfully!' : 'Document created successfully!');
        closeModal();
        await loadDocuments();
    } catch (error) {
        console.error('Error saving document:', error);
        showError(error.message);
    } finally {
        submitBtn.disabled = false;
        document.getElementById('btnText').textContent = originalText;
    }
});

// View document
async function viewDocument(id) {
    try {
        const response = await fetch(`${API_BASE}/api/documents/${id}`, {
            headers: getHeaders(),
            credentials: 'include'
        });
        
        const data = await response.json();
        
        if (!response.ok || !data.success) {
            throw new Error(data.error || 'Failed to load document');
        }
        
        window.open(data.document.pdfUrl, '_blank');
    } catch (error) {
        showError('Failed to view document: ' + error.message);
    }
}

// Edit document
async function editDocument(id) {
    try {
        const response = await fetch(`${API_BASE}/api/documents/${id}`, {
            headers: getHeaders(),
            credentials: 'include'
        });
        
        const data = await response.json();
        
        if (!response.ok || !data.success) {
            throw new Error(data.error || 'Failed to load document');
        }
        
        const doc = data.document;
        
        document.getElementById('modalTitle').textContent = 'Edit Document';
        document.getElementById('btnText').textContent = 'Update Document';
        document.getElementById('documentId').value = doc._id;
        
        // Fill form fields
        const fields = Object.keys(doc.formData || {});
        fields.forEach(field => {
            const input = document.getElementById(field);
            if (input && field !== 'isSigned') {
                input.value = doc.formData[field] || '';
            }
        });

        const isSignedCheckbox = document.getElementById('isSigned');
        if (isSignedCheckbox) {
            // Handle different possible storage formats
            const isSignedValue = doc.formData?.isSigned ?? doc.isSigned ?? false;
            console.log('Loading isSigned value:', isSignedValue, 'Type:', typeof isSignedValue);
            isSignedCheckbox.checked = Boolean(isSignedValue);
        }
        
        if (doc.expiresAt) {
            const date = new Date(doc.expiresAt);
            document.getElementById('expiresAt').value = date.toISOString().slice(0, 16);
        }
        
        document.getElementById('documentModal').classList.remove('hidden');
    } catch (error) {
        showError('Failed to load document: ' + error.message);
    }
}

// Delete document
async function deleteDocument(id) {
    if (!confirm('Are you sure you want to delete this document? This action cannot be undone.')) {
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE}/api/documents/${id}`, {
            method: 'DELETE',
            headers: getHeaders(),
            credentials: 'include'
        });
        
        const data = await response.json();
        
        if (!response.ok || !data.success) {
            throw new Error(data.error || 'Failed to delete document');
        }
        
        showSuccess('Document deleted successfully!');
        await loadDocuments();
    } catch (error) {
        showError('Failed to delete document: ' + error.message);
    }
}

// Expire document
async function expireDocument(id) {
    if (!confirm('Are you sure you want to expire this document? The QR code will stop working.')) {
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE}/api/documents/${id}/expire`, {
            method: 'PUT',
            headers: getHeaders(),
            credentials: 'include'
        });
        
        const data = await response.json();
        
        if (!response.ok || !data.success) {
            throw new Error(data.error || 'Failed to expire document');
        }
        
        showSuccess('Document expired successfully!');
        await loadDocuments();
    } catch (error) {
        showError('Failed to expire document: ' + error.message);
    }
}

// Logout
async function logout() {
    try {
        await fetch(`${API_BASE}/api/auth/logout`, {
            method: 'GET',
            headers: getHeaders(),
            credentials: 'include'
        });
    } catch (error) {
        console.error('Logout error:', error);
    } finally {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
    }
}

// Show success message
function showSuccess(message) {
    alert('✅ ' + message);
}

// Show error message
function showError(message) {
    alert('❌ ' + message);
}

