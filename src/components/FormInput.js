import React from 'react';
import '../pages/css/Users.css'

const FormInput = ({ type = "text", placeholder, value, onChange, showErrors }) => {
    return (
        <div className="form-group">
            <input
                type={type}
                placeholder={placeholder}
                value={value}
                onChange={onChange}
                className={!value && showErrors ? "input-error" : ""}
            />
            {!value && showErrors && <div className="error-msg"> Required Field</div>}
        </div>
    );
};

export default FormInput;