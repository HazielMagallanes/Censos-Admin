import React, { useState } from "react";
import AttributeManagement from "./AttributeManagement";
import TemplateManagement from "./TemplateManagement";

const TemplateAndAttribute: React.FC = () => {
    const [attributeScene, setAttributeScene] = useState<boolean>(true);

    const handleToggleScene = (value: boolean) => {
        setAttributeScene(value);
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
