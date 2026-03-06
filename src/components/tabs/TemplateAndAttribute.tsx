import React, { useState, useEffect } from "react";
import AttributeManagement from "./AttributeManagement";
import TemplateManagement from "./TemplateManagement";

const TemplateAndAttribute: React.FC = () => {
    const [attributeScene, setAttributeScene] = useState<boolean>(true);

    // Load the persisted scene from localStorage on component mount
    useEffect(() => {
        const savedScene = localStorage.getItem("selectedScene");
        if (savedScene !== null) {
            setAttributeScene(savedScene === "attribute");
        }
    }, []);

    const handleToggleScene = (value: boolean) => {
        setAttributeScene(value);
        // Persist the selected scene to localStorage
        localStorage.setItem("selectedScene", value ? "attribute" : "template");
    };

    return (
        <div>
            {attributeScene ? (
                <AttributeManagement onToggleScene={handleToggleScene} isActive={true} />
            ) : (
                <TemplateManagement onToggleScene={handleToggleScene} isActive={false} />
            )}
        </div>
    );
};

export default TemplateAndAttribute;
