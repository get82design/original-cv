type TextStyle = {
    sizeModel: string;
    weightModel: number;
    colorSelect: "primaryColor" | "gray" | "black" | "white";
    sizeSelect: "xs" | "sm" | "md" | "lg" | "xl";
    weightSelect: "xs" | "sm" | "md" | "lg" | "xl";
    withPrimaryColor: boolean;
    textAlign?: "left" | "center" | "right" | "justify" | null;
};

export type ThemeTokens = {
    headerTitle: TextStyle;
    headerSubTitle: TextStyle;
    headerContent: TextStyle;
    headerNom: TextStyle;
    headerPrenom: TextStyle;
    sectionTitle: TextStyle;
    itemTitle: TextStyle;
    meta: TextStyle;   // company, dates, ville…
    body: TextStyle;   // description, missions
};

export const classiqueTokens: ThemeTokens = {
    headerTitle: {
      sizeModel: "28px", 
      weightModel: 700,
      colorSelect: "primaryColor", 
      sizeSelect: "md", 
      weightSelect: "md",
      withPrimaryColor: true, 
      textAlign: "left",
    },
    headerSubTitle: {
      sizeModel: "20px", 
      weightModel: 600,
      colorSelect: "gray", 
      sizeSelect: "md", 
      weightSelect: "md",
      withPrimaryColor: true, 
      textAlign: "left",
    },
    headerContent: {
      sizeModel: "13px", 
      weightModel: 400,
      colorSelect: "black", 
      sizeSelect: "md", 
      weightSelect: "md",
      withPrimaryColor: false, 
      textAlign: "left",
    },
    headerNom: {
      sizeModel: "16px",
      weightModel: 600,
      colorSelect: "black",
      sizeSelect: "md",
      weightSelect: "md",
      withPrimaryColor: true,
    },
    headerPrenom: {
      sizeModel: "16px",
      weightModel: 600,
      colorSelect: "black",
      sizeSelect: "md",
      weightSelect: "md",
      withPrimaryColor: true,
    },
    sectionTitle: {
      sizeModel: "18px",
      weightModel: 700,
      colorSelect: "primaryColor", 
      sizeSelect: "lg", 
      weightSelect: "lg",
      withPrimaryColor: true,
    },
    itemTitle: {
      sizeModel: "16px", 
      weightModel: 600,
      colorSelect: "black", 
      sizeSelect: "md", 
      weightSelect: "md",
      withPrimaryColor: true,
    },
    meta: {
      sizeModel: "14px", 
      weightModel: 500,
      colorSelect: "black", 
      sizeSelect: "md", 
      weightSelect: "md",
      withPrimaryColor: true,
    },
    body: {
      sizeModel: "13px", 
      weightModel: 400,
      colorSelect: "black", 
      sizeSelect: "md", 
      weightSelect: "md",
      withPrimaryColor: false, 
      textAlign: "left",
    },
};

// Même structure, valeurs différentes = personnalité du thème
export const moderneTokens: ThemeTokens = {
    ...classiqueTokens,
    headerTitle: { 
        ...classiqueTokens.headerTitle,
        textAlign: "center",
    },
    headerSubTitle: {
        ...classiqueTokens.headerSubTitle,
        textAlign: "center",
    },
    sectionTitle: { 
        ...classiqueTokens.sectionTitle, 
        sizeModel: "16px", weightModel: 600, 
        sizeSelect: "md" 
    },
    itemTitle: { 
        ...classiqueTokens.itemTitle, 
        sizeModel: "15px", 
        weightModel: 500 
    },
    body: { 
        ...classiqueTokens.body, 
        sizeModel: "12px", 
        textAlign: "justify" 
    },
  };

export const minimalTokens: ThemeTokens = {
    ...classiqueTokens,
    sectionTitle: { 
        ...classiqueTokens.sectionTitle, 
        sizeModel: "14px", 
        weightModel: 600, 
        colorSelect: "black" 
    },
    itemTitle: { 
        ...classiqueTokens.itemTitle, 
        sizeModel: "14px", 
        weightModel: 500 
    },
    meta: { 
        ...classiqueTokens.meta, 
        sizeModel: "12px", 
        weightModel: 400 
    },
    body: { 
        ...classiqueTokens.body, 
        sizeModel: "12px" 
    },
  };