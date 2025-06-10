
import "./css/LeadDetail.css";
import { useState, useEffect, useCallback } from "react";
import apiClient from "../apicaller/APIClient.js";
import { toast } from 'react-toastify';
import Cookies from 'js-cookie';

export default function LeadDetailsPage({ leadId, onBack }) {
    
    const userId = Cookies.get("user_id") 
    const [leadDetails, setLeadDetails] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [editingSection, setEditingSection] = useState(null);
    const [saving, setSaving] = useState(false);

    const fetchLeadDetails = useCallback(async () => {
        if (!leadId) {
            setError("Invalid lead ID");
            setLoading(false);
            return;
        }

        setLoading(true);
        setError(null);
        
        try {
            const response = await apiClient.get(`/lead/get-lead-detail/${leadId}`);
            console.log(response.data)
            const leadData = Array.isArray(response.data.data)
                ? response.data.data[0]
                : response.data.data;
            
            setLeadDetails(leadData || null);
        } catch (error) {
            console.error("Failed to fetch lead details:", error);
            setError("Failed to load lead details. Please try again.");
        } finally {
            setLoading(false);
        }
    }, [leadId]);

    useEffect(() => {
        fetchLeadDetails();
    }, [fetchLeadDetails]);

    const handleEditSection = (section) => {
        setEditingSection(section);
    };

    const handleCancelEdit = () => {
        setEditingSection(null);
    };

    const handleSaveSection = async (section, updatedData) => {
        if (saving) return; // Prevent multiple simultaneous saves
        
        setSaving(true);
        try {
            let response;
            
            switch (section) {
                case 'company':
                    response = await apiClient.put(`/lead/update-lead/${leadId}`, updatedData);
                    break;
                    
                case 'contact':
                    // Handle contact updates more carefully
                    if (updatedData.contact_details && Array.isArray(updatedData.contact_details)) {
                        const contactPromises = updatedData.contact_details.map(async (contact) => {
                            if (contact.contact_id) {
                                return await apiClient.put(`/lead/update-lead-contact/${leadId}/${contact.contact_id}`, contact);
                            } else {
                                return await apiClient.post(`/lead/add-lead-contact/${userId}`, contact);
                            }
                        });
                        await Promise.all(contactPromises);
                    }
                    break;
                    
                case 'office':
                    // Handle office updates more carefully
                    if (updatedData.office_details && Array.isArray(updatedData.office_details)) {
                        const officePromises = updatedData.office_details.map(async (office) => {
                            if (office.office_id) {
                                const { office_id, ...officePayload } = office;
                                return await apiClient.put(`/lead/update-lead-office/${leadId}/${office.office_id}`, officePayload);
                            } else {
                                return await apiClient.post(`/lead/add-lead-office/`, office);
                            }
                        });
                        await Promise.all(officePromises);
                    }
                    break;
                    
                default:
                    throw new Error(`Unknown section: ${section}`);
            }
            
            setEditingSection(null);

            await fetchLeadDetails();
            toast.success('Updated successfully');
            
        } catch (error) {
            console.error(`Failed to update ${section}:`, error);
            toast.error('Failed to update');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="lead-details-page">
                <div className="loading-container">
                    <p>Loading lead details...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="lead-details-page">
                <div className="error-container">
                    <p className="error-message">{error}</p>
                    <button onClick={onBack} className="back-button">
                        Back to Leads
                    </button>
                </div>
            </div>
        );
    }

    if (!leadDetails) {
        return (
            <div className="lead-details-page">
                <div className="error-container">
                    <p>Lead details not found.</p>
                    <button onClick={onBack} className="back-button">
                        Back to Leads
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="lead-details-page">
            <div className="lead-details-header">
                <button onClick={onBack} className="back-button">
                    ← Back to Leads
                </button>
                <h1>Lead Details</h1>
            </div>

            <div className="lead-details-container">
                {/* Company & Product Section */}
                <CompanySection
                    leadDetails={leadDetails}
                    isEditing={editingSection === 'company'}
                    onEdit={() => handleEditSection('company')}
                    onCancel={handleCancelEdit}
                    onSave={(data) => handleSaveSection('company', data)}
                    saving={saving}
                />

                {/* Contact Details Section */}
                <ContactSection
                    leadDetails={leadDetails}
                    leadId={leadId}
                    isEditing={editingSection === 'contact'}
                    onEdit={() => handleEditSection('contact')}
                    onCancel={handleCancelEdit}
                    onSave={(data) => handleSaveSection('contact', data)}
                    saving={saving}
                />

                {/* Office Details Section */}
                <OfficeSection
                    leadDetails={leadDetails}
                    leadId={leadId}
                    isEditing={editingSection === 'office'}
                    onEdit={() => handleEditSection('office')}
                    onCancel={handleCancelEdit}
                    onSave={(data) => handleSaveSection('office', data)}
                    saving={saving}
                />
            </div>
        </div>
    );
}

// Company Section Component
function CompanySection({ leadDetails, isEditing, onEdit, onCancel, onSave, saving }) {
    const [formData, setFormData] = useState({
        company_name: '',
        product: '',
        industry_type: '',
        insured_amount: '',
        export_value: '',
        status: ''
    });

    // Initialize form data when component mounts or leadDetails changes
    useEffect(() => {
        setFormData({
            company_name: leadDetails.company_name || '',
            product: leadDetails.product || '',
            industry_type: leadDetails.industry_type || '',
            insured_amount: leadDetails.insured_amount || '',
            export_value: leadDetails.export_value || '',
            status: leadDetails.status || ''
        });
    }, [leadDetails]);

    const handleInputChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSave = () => {
        // Basic validation
        if (!formData.company_name.trim()) {
            toast.error('Company name is required');
            return;
        }
        onSave(formData);
    };

    return (
        <div className="details-section">
            <div className="section-header">
                <h2>Company & Product Information</h2>
                {!isEditing && (
                    <button onClick={onEdit} className="edit-button" disabled={saving}>
                        Edit
                    </button>
                )}
            </div>

            {isEditing ? (
                <div className="edit-form">
                    <div className="form-row">
                        <label>Company Name:</label>
                        <input
                            type="text"
                            value={formData.company_name}
                            onChange={(e) => handleInputChange('company_name', e.target.value)}
                            required
                        />
                    </div>
                    <div className="form-row">
                        <label>Product:</label>
                        <input
                            type="text"
                            value={formData.product}
                            onChange={(e) => handleInputChange('product', e.target.value)}
                        />
                    </div>
                    <div className="form-row">
                        <label>Industry Type:</label>
                        <input
                            type="text"
                            value={formData.industry_type}
                            onChange={(e) => handleInputChange('industry_type', e.target.value)}
                        />
                    </div>
                    <div className="form-row">
                        <label>Insured Amount:</label>
                        <input
                            type="number"
                            value={formData.insured_amount}
                            onChange={(e) => handleInputChange('insured_amount', e.target.value)}
                            min="0"
                            step="0.01"
                        />
                    </div>
                    <div className="form-row">
                        <label>Export Value:</label>
                        <input
                            type="number"
                            value={formData.export_value}
                            onChange={(e) => handleInputChange('export_value', e.target.value)}
                            min="0"
                            step="0.01"
                        />
                    </div>
                    <div className="form-row">
                        <label>Status:</label>
                        <select
                            value={formData.status}
                            onChange={(e) => handleInputChange('status', e.target.value)}
                        >
                            <option value="">Select Status</option>
                            <option value="new">New</option>
                            <option value="no pickup">No Pickup</option>
                            <option value="contacted">Contacted</option>
                            <option value="call back">Call Back</option>
                            <option value="complete">Complete</option>
                            <option value="closed">Closed</option>
                        </select>
                    </div>
                    <div className="form-actions">
                        <button 
                            onClick={handleSave} 
                            className="save-button"
                            disabled={saving}
                        >
                            {saving ? 'Saving...' : 'Save'}
                        </button>
                        <button 
                            onClick={onCancel} 
                            className="cancel-button"
                            disabled={saving}
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            ) : (
                <div className="view-content">
                    <div className="detail-item">
                        <strong>Company Name:</strong> {leadDetails.company_name || 'N/A'}
                    </div>
                    <div className="detail-item">
                        <strong>Product:</strong> {leadDetails.product || 'N/A'}
                    </div>
                    <div className="detail-item">
                        <strong>Industry Type:</strong> {leadDetails.industry_type || 'N/A'}
                    </div>
                    <div className="detail-item">
                        <strong>Insured Amount:</strong> {leadDetails.insured_amount || "N/A"}
                    </div>
                    <div className="detail-item">
                        <strong>Export Value:</strong> {leadDetails.export_value || "N/A"}
                    </div>
                    <div className="detail-item">
                        <strong>Status:</strong> {leadDetails.status || 'N/A'}
                    </div>
                    <div className="detail-item">
                        <strong>Created Date:</strong> {leadDetails.created_date || 'N/A'}
                    </div>
                </div>
            )}
        </div>
    );
}

// Contact Section Component
function ContactSection({ leadDetails, leadId, isEditing, onEdit, onCancel, onSave, saving }) {
    const [contacts, setContacts] = useState([]);


    useEffect(() => {
        const initialContacts = leadDetails.contact_details || [];
        setContacts(initialContacts.length > 0 ? initialContacts : [{
            name: '',
            email: '',
            phone: '',
            alt_phone: ''
        }]);
    }, [leadDetails.contact_details]);

    const handleContactChange = (index, field, value) => {
        const updatedContacts = [...contacts];
        updatedContacts[index] = { ...updatedContacts[index], [field]: value };
        setContacts(updatedContacts);
    };

    const addNewContact = () => {
        setContacts([...contacts, {
            lead_id: leadId,
            name: '',
            email: '',
            phone: '',
            alt_phone: ''
        }]);
    };

    const removeContact = (index) => {
        if (contacts.length <= 1) {
            alert('At least one contact is required');
            return;
        }
        const updatedContacts = contacts.filter((_, i) => i !== index);
        setContacts(updatedContacts);
    };

    const validateContacts = () => {
        for (let i = 0; i < contacts.length; i++) {
            const contact = contacts[i];
            if (!contact.name?.trim()) {
                alert(`Contact ${i + 1}: Name is required`);
                return false;
            }
            if (contact.email && !/\S+@\S+\.\S+/.test(contact.email)) {
                alert(`Contact ${i + 1}: Please enter a valid email address`);
                return false;
            }
        }
        return true;
    };

    const handleSave = () => {
        if (!validateContacts()) return;
        onSave({ contact_details: contacts });
    };

    return (
        <div className="details-section">
            <div className="section-header">
                <h2>Contact Details</h2>
                {!isEditing && (
                    <button onClick={onEdit} className="edit-button" disabled={saving}>
                        Edit
                    </button>
                )}
            </div>

            {isEditing ? (
                <div className="edit-form">
                    {contacts.map((contact, index) => (
                        <div key={contact.contact_id || index} className="contact-edit-block">
                            <div className="contact-header">
                                <h4>Contact {index + 1}</h4>
                                {contacts.length > 1 && (
                                    <button 
                                        type="button"
                                        onClick={() => removeContact(index)}
                                        className="remove-button"
                                        disabled={saving}
                                    >
                                        Remove
                                    </button>
                                )}
                            </div>
                            <div className="form-row">
                                <label>Name: *</label>
                                <input
                                    type="text"
                                    value={contact.name || ''}
                                    onChange={(e) => handleContactChange(index, 'name', e.target.value)}
                                    required
                                />
                            </div>
                            <div className="form-row">
                                <label>Email:</label>
                                <input
                                    type="email"
                                    value={contact.email || ''}
                                    onChange={(e) => handleContactChange(index, 'email', e.target.value)}
                                />
                            </div>
                            <div className="form-row">
                                <label>Phone:</label>
                                <input
                                    type="tel"
                                    value={contact.phone || ''}
                                    onChange={(e) => handleContactChange(index, 'phone', e.target.value)}
                                />
                            </div>
                            <div className="form-row">
                                <label>Alt Phone:</label>
                                <input
                                    type="tel"
                                    value={contact.alt_phone || ''}
                                    onChange={(e) => handleContactChange(index, 'alt_phone', e.target.value)}
                                />
                            </div>
                        </div>
                    ))}
                    
                    <button 
                        type="button"
                        onClick={addNewContact}
                        className="add-button"
                        disabled={saving}
                    >
                        + Add New Contact
                    </button>
                    
                    <div className="form-actions">
                        <button 
                            onClick={handleSave} 
                            className="save-button"
                            disabled={saving}
                        >
                            {saving ? 'Saving...' : 'Save'}
                        </button>
                        <button 
                            onClick={onCancel} 
                            className="cancel-button"
                            disabled={saving}
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            ) : (
                <div className="view-content">
                    {contacts && contacts.length > 0 ? (
                        contacts.map((contact, index) => (
                            <div key={contact.contact_id || index} className="contact-block">
                                <h4>Contact {index + 1}</h4>
                                <div className="detail-item">
                                    <strong>Name:</strong> {contact.name || 'N/A'}
                                </div>
                                <div className="detail-item">
                                    <strong>Email:</strong> {contact.email || 'N/A'}
                                </div>
                                <div className="detail-item">
                                    <strong>Phone:</strong> {contact.phone || 'N/A'}
                                </div>
                                <div className="detail-item">
                                    <strong>Alt Phone:</strong> {contact.alt_phone || 'N/A'}
                                </div>
                            </div>
                        ))
                    ) : (
                        <p>No contact details available.</p>
                    )}
                </div>
            )}
        </div>
    );
}

// Office Section Component
function OfficeSection({ leadDetails, leadId, isEditing, onEdit, onCancel, onSave, saving }) {
    const [offices, setOffices] = useState([]);

    // Initialize offices when component mounts or leadDetails changes
    useEffect(() => {
        const initialOffices = leadDetails.office_details || [];
        setOffices(initialOffices.length > 0 ? initialOffices : [{
            address: '',
            city: '',
            country: ''
        }]);
    }, [leadDetails.office_details]);

    const handleOfficeChange = (index, field, value) => {
        const updatedOffices = [...offices];
        updatedOffices[index] = { ...updatedOffices[index], [field]: value };
        setOffices(updatedOffices);
    };

    const addNewOffice = () => {
        setOffices([...offices, {
            lead_id: leadId,
            address: '',
            city: '',
            district: '',
            country: '',
            postal_code: ''
        }]);
    };

    const removeOffice = (index) => {
        if (offices.length <= 1) {
            alert('At least one office is required');
            return;
        }
        const updatedOffices = offices.filter((_, i) => i !== index);
        setOffices(updatedOffices);
    };

    const validateOffices = () => {
        for (let i = 0; i < offices.length; i++) {
            const office = offices[i];
            if (!office.address?.trim()) {
                alert(`Office ${i + 1}: Address is required`);
                return false;
            }
        }
        return true;
    };

    const handleSave = () => {
        if (!validateOffices()) return;
        onSave({ office_details: offices });
    };

    return (
        <div className="details-section">
            <div className="section-header">
                <h2>Office Details</h2>
                {!isEditing && (
                    <button onClick={onEdit} className="edit-button" disabled={saving}>
                        Edit
                    </button>
                )}
            </div>

            {isEditing ? (
                <div className="edit-form">
                    {offices.map((office, index) => (
                        <div key={office.office_id || index} className="office-edit-block">
                            <div className="office-header">
                                <h4>Office {index + 1}</h4>
                                {offices.length > 1 && (
                                    <button 
                                        type="button"
                                        onClick={() => removeOffice(index)}
                                        className="remove-button"
                                        disabled={saving}
                                    >
                                        Remove
                                    </button>
                                )}
                            </div>
                            <div className="form-row">
                                <label>Address: *</label>
                                <textarea
                                    value={office.address || ''}
                                    onChange={(e) => handleOfficeChange(index, 'address', e.target.value)}
                                    rows="3"
                                    required
                                />
                            </div>
                            <div className="form-row">
                                <label>City:</label>
                                <input
                                    type="text"
                                    value={office.city || ''}
                                    onChange={(e) => handleOfficeChange(index, 'city', e.target.value)}
                                />
                            </div>
                             <div className="form-row">
                                <label>District:</label>
                                <input
                                    type="text"
                                    value={office.district || ''}
                                    onChange={(e) => handleOfficeChange(index, 'district', e.target.value)}
                                />
                            </div>
                            <div className="form-row">
                                <label>Country:</label>
                                <input
                                    type="text"
                                    value={office.country || ''}
                                    onChange={(e) => handleOfficeChange(index, 'country', e.target.value)}
                                />
                            </div>
                            <div className="form-row">
                                <label>Postal Code:</label>
                                <input
                                    type="text"
                                    value={office.postal_code || ''}
                                    onChange={(e) => handleOfficeChange(index, 'postal_code', e.target.value)}
                                />
                            </div>
                        </div>
                    ))}
                    
                    <button 
                        type="button"
                        onClick={addNewOffice}
                        className="add-button"
                        disabled={saving}
                    >
                        + Add New Office
                    </button>
                    
                    <div className="form-actions">
                        <button 
                            onClick={handleSave} 
                            className="save-button"
                            disabled={saving}
                        >
                            {saving ? 'Saving...' : 'Save'}
                        </button>
                        <button 
                            onClick={onCancel} 
                            className="cancel-button"
                            disabled={saving}
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            ) : (
                <div className="view-content">
                    {offices && offices.length > 0 ? (
                        offices.map((office, index) => (
                            <div key={office.office_id || index} className="office-block">
                                <h4>Office {index + 1}</h4>
                                <div className="detail-item">
                                    <strong>Address:</strong> {office.address || 'N/A'}
                                </div>
                                <div className="detail-item">
                                    <strong>City:</strong> {office.city || 'N/A'}
                                </div>
                                <div className="detail-item">
                                    <strong>Country:</strong> {office.country || 'N/A'}
                                </div>
                            </div>
                        ))
                    ) : (
                        <p>No office details available.</p>
                    )}
                </div>
            )}
        </div>
    );
}