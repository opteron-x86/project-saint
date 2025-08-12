// src/components/common/UnderConstructionWrapper.tsx
import React from 'react';
import UnderConstruction from './UnderConstruction';

interface UnderConstructionWrapperProps {
  isUnderConstruction: boolean;
  pageName?: string;
  description?: string;
  children: React.ReactNode;
}

const UnderConstructionWrapper: React.FC<UnderConstructionWrapperProps> = ({
  isUnderConstruction,
  pageName,
  description,
  children,
}) => {
  if (isUnderConstruction) {
    return (
      <UnderConstruction
        pageName={pageName}
        description={description}
      />
    );
  }

  return <>{children}</>;
};

export default UnderConstructionWrapper;