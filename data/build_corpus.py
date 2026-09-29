"""
Script to curate and build the authoritative legal corpus for SAKTI RAG Agent.
Generates structured JSON documents in data/corpus/ matching the schema:
id, jurisdiction, statute, section_rule, authority, official_url, content.
"""

import json
from pathlib import Path

CORPUS_DIR = Path(__file__).resolve().parent.parent / "data" / "corpus"
CORPUS_DIR.mkdir(parents=True, exist_ok=True)

PROVISIONS = [
    # ==========================================
    # 1. INDIA: PATENTS ACT, 1970 & RULES
    # ==========================================
    {
        "id": "IN-PAT-SEC-003P",
        "jurisdiction": "India",
        "statute": "The Patents Act, 1970 (as amended)",
        "section_rule": "Section 3(p)",
        "authority": "Office of the Controller General of Patents, Designs and Trade Marks (CGPDTM / IP India)",
        "official_url": "https://ipindia.gov.in/writereaddata/Portal/IPOAct/1_31_1_patent-act-1970-11march2015.pdf",
        "title": "Exclusion of Traditional Knowledge from Patentability",
        "category": "patents",
        "content": (
            "Section 3(p) of the Patents Act, 1970 explicitly provides that 'an invention which in effect, is traditional "
            "knowledge or which is an aggregation or duplication of known properties of traditionally known component or "
            "components' is not an invention within the meaning of this Act and cannot be patented.\n\n"
            "Key Legal Implications for Ayurveda:\n"
            "1. Known medicinal uses of Ayurvedic herbs (e.g., Curcuma longa/Haldi for wound healing, Azadirachta indica/Neem "
            "for antibacterial use) already documented in classical texts or community knowledge fall squarely under Section 3(p).\n"
            "2. Merely presenting a known herb in a new physical format (e.g., tablet or capsule instead of traditional churna/kwath) "
            "remains barred under Section 3(p).\n"
            "3. To overcome Section 3(p), the applicant must demonstrate that the invention is NOT an aggregation or duplication "
            "of known properties, but involves an unexpected synergistic effect, or a novel, non-obvious isolation/fractionation process "
            "not disclosed or suggested in any traditional knowledge literature (including the TKDL)."
        )
    },
    {
        "id": "IN-PAT-SEC-003E",
        "jurisdiction": "India",
        "statute": "The Patents Act, 1970 (as amended)",
        "section_rule": "Section 3(e)",
        "authority": "Office of the Controller General of Patents, Designs and Trade Marks (CGPDTM / IP India)",
        "official_url": "https://ipindia.gov.in/writereaddata/Portal/IPOAct/1_31_1_patent-act-1970-11march2015.pdf",
        "title": "Exclusion of Mere Admixtures Resulting Only in Aggregation of Properties",
        "category": "patents",
        "content": (
            "Section 3(e) excludes from patentability 'a substance obtained by a mere admixture resulting only in the aggregation "
            "of the properties of the components thereof or a process for producing such substance'.\n\n"
            "Key Legal Implications for Ayurveda:\n"
            "1. Polyherbal formulations: Combining two or more traditionally known Ayurvedic herbs (e.g., Turmeric and Black Pepper) "
            "is prima facie presumed to be a mere admixture under Section 3(e).\n"
            "2. Statutory Requirement for Patentability: The patent applicant must provide comparative experimental data demonstrating "
            "a synergistic effect—meaning the combined therapeutic efficacy is substantially superior to the sum of the individual "
            "components acting independently.\n"
            "3. Processing methods: A process combining known components is non-patentable unless it produces a new synergistic product "
            "with non-obvious technical advantages."
        )
    },
    {
        "id": "IN-PAT-SEC-003D",
        "jurisdiction": "India",
        "statute": "The Patents Act, 1970 (as amended)",
        "section_rule": "Section 3(d)",
        "authority": "Office of the Controller General of Patents, Designs and Trade Marks (CGPDTM / IP India)",
        "official_url": "https://ipindia.gov.in/writereaddata/Portal/IPOAct/1_31_1_patent-act-1970-11march2015.pdf",
        "title": "Exclusion of Mere Discovery of Known Substance without Enhanced Efficacy",
        "category": "patents",
        "content": (
            "Section 3(d) excludes 'the mere discovery of a new form of a known substance which does not result in the enhancement "
            "of the known efficacy of that substance or the mere discovery of any new property or new use for a known substance or of the "
            "mere use of a known process, machine or apparatus unless such known process results in a new product or employs at least one "
            "new reactant'.\n\n"
            "Explanation: Salts, esters, ethers, polymorphs, metabolites, pure form, particle size, isomers, complexes, and combinations "
            "shall be considered to be the same substance, unless they differ significantly in properties with regard to efficacy.\n\n"
            "Ayurvedic Application:\n"
            "Isolating a known molecule (e.g., curcumin from turmeric) or preparing a nanoparticle / liposomal delivery system of a known "
            "herbal extract is unpatentable under Section 3(d) unless substantial therapeutic efficacy enhancement is experimentally proved."
        )
    },
    {
        "id": "IN-PAT-SEC-010-4D",
        "jurisdiction": "India",
        "statute": "The Patents Act, 1970 (as amended)",
        "section_rule": "Section 10(4)(d) & Proviso",
        "authority": "Office of the Controller General of Patents, Designs and Trade Marks (CGPDTM / IP India)",
        "official_url": "https://ipindia.gov.in/writereaddata/Portal/IPOAct/1_31_1_patent-act-1970-11march2015.pdf",
        "title": "Mandatory Disclosure of Biological Material and Source / Geographical Origin",
        "category": "patents",
        "content": (
            "Section 10(4)(d) mandates that the complete specification must fully and particularly describe the invention. "
            "The second proviso to Section 10(4) explicitly dictates:\n"
            "'Provided further that the specification shall disclose the source and geographical origin of the biological material "
            "in the specification, when that invention involves the use of biological material in the invention.'\n\n"
            "Compliance Requirements:\n"
            "1. Every patent application in India utilizing Ayurvedic herbs, animal derivatives, or microbial agents must declare "
            "the precise geographical origin (e.g., specific district, state, forest reserve in India) where the specimen was collected.\n"
            "2. Non-disclosure or wrongful disclosure of source/origin is an independent statutory ground for pre-grant opposition, "
            "post-grant opposition (Sec 25), and total revocation of the patent (Sec 64(1)(p))."
        )
    },
    {
        "id": "IN-PAT-SEC-025-OPP",
        "jurisdiction": "India",
        "statute": "The Patents Act, 1970 (as amended)",
        "section_rule": "Section 25(1)(k) & 25(2)(k)",
        "authority": "Office of the Controller General of Patents, Designs and Trade Marks (CGPDTM / IP India)",
        "official_url": "https://ipindia.gov.in/writereaddata/Portal/IPOAct/1_31_1_patent-act-1970-11march2015.pdf",
        "title": "Opposition on Grounds of Anticipation by Traditional Knowledge",
        "category": "patents",
        "content": (
            "Under Section 25(1)(k) (Pre-grant opposition) and Section 25(2)(k) (Post-grant opposition), any person may challenge "
            "a patent application or granted patent on the ground:\n"
            "'that the complete specification does not disclose or wrongly mentions the source or geographical origin of biological "
            "material used for the invention' or 'that the invention so far as claimed in any claim of the complete specification was "
            "anticipated having regard to the knowledge, oral or otherwise, available within any local or indigenous community in India or elsewhere'.\n\n"
            "Practical Application:\n"
            "The CSIR Traditional Knowledge Digital Library (TKDL) unit routinely files Section 25(1) pre-grant oppositions against "
            "domestic and international patent claims by citing prior publication in classical Ayurvedic texts (Charaka Samhita, Sushruta Samhita, etc.)."
        )
    },
    {
        "id": "IN-PAT-SEC-064-REV",
        "jurisdiction": "India",
        "statute": "The Patents Act, 1970 (as amended)",
        "section_rule": "Section 64(1)(p) & 64(1)(q)",
        "authority": "High Court / Intellectual Property Division (IPD)",
        "official_url": "https://ipindia.gov.in/writereaddata/Portal/IPOAct/1_31_1_patent-act-1970-11march2015.pdf",
        "title": "Revocation of Patent on Grounds of Traditional Knowledge and Biological Material Non-Disclosure",
        "category": "patents",
        "content": (
            "Under Section 64(1), a patent may be revoked on petition of any interested person or Central Government on grounds:\n"
            "(p) that the complete specification does not disclose or wrongly mentions the source or geographical origin of biological "
            "material used for the invention;\n"
            "(q) that the invention so far as claimed in any claim of the complete specification was anticipated having regard to the knowledge, "
            "oral or otherwise, available within any local or indigenous community in India or elsewhere.\n\n"
            "Legal Effect: Revocation renders the patent void ab initio. Absolute compliance with botanical identification and NBA approval is critical."
        )
    },
    {
        "id": "IN-PAT-GUI-AYU-001",
        "jurisdiction": "India",
        "statute": "CGPDTM Guidelines for Examination of Patent Applications relating to TK and Biological Material",
        "section_rule": "Guidelines Paragraph 5.1 - 5.5",
        "authority": "Office of the Controller General of Patents, Designs and Trade Marks (CGPDTM)",
        "official_url": "https://ipindia.gov.in/writereaddata/Portal/IPOGuidelines/1_37_1_guidelines-examination-patent-applications-traditional-knowledge-biological-material.pdf",
        "title": "Official Examination Guidelines for Traditional Knowledge Inventions",
        "category": "patents",
        "content": (
            "The Indian Patent Office guidelines establish standard examination tests for Ayurvedic inventions:\n"
            "1. Novelty Assessment: Search in TKDL and public databases. If an ingredient or combination is cited in classical texts "
            "for the same or similar therapeutic indication, lack of novelty is raised under Section 2(1)(j) read with Section 3(p).\n"
            "2. Inventive Step Assessment: The examiner evaluates whether adding an excipient, standardizing an extract, or choosing a "
            "specific fraction is obvious to a person skilled in the art (an Ayurvedic vaidya or pharmacognosist).\n"
            "3. Synergistic Data Obligation: If combination claims are filed, the applicant must file bioassay results showing that the "
            "combination index is less than 1.0 or efficacy is significantly non-additive.\n"
            "4. NBA Permission Verification: The patent office will mark the patent application as defective unless National Biodiversity "
            "Authority (NBA) permission under Section 6 of the Biological Diversity Act is submitted before the grant."
        )
    },

    # ==========================================
    # 2. INDIA: BIOLOGICAL DIVERSITY ACT & ABS
    # ==========================================
    {
        "id": "IN-BDA-SEC-003",
        "jurisdiction": "India",
        "statute": "The Biological Diversity Act, 2002 (amended 2023)",
        "section_rule": "Section 3",
        "authority": "National Biodiversity Authority (NBA)",
        "official_url": "https://nbaindia.org/content/25/19/1/act.html",
        "title": "Approval Required for Foreign Entities Accessing Biological Resources",
        "category": "biodiversity_abs",
        "content": (
            "Section 3 mandates that certain persons cannot obtain any biological resource occurring in India or knowledge associated "
            "thereto for research, commercial utilization, bio-survey, or bio-utilization without prior approval of the National Biodiversity Authority.\n\n"
            "Covered Persons/Entities:\n"
            "(a) A person who is not a citizen of India;\n"
            "(b) A citizen of India who is an NRI;\n"
            "(c) A body corporate, association or organization not incorporated or registered in India, or incorporated in India which has "
            "any non-Indian participation in its share capital or management (Note: 2023 amendment exempted Indian companies registered under "
            "Companies Act from Section 3 provided foreign shareholding conforms to codified FDI limits, but strict prior approval applies if "
            "foreign control exists)."
        )
    },
    {
        "id": "IN-BDA-SEC-004",
        "jurisdiction": "India",
        "statute": "The Biological Diversity Act, 2002 (amended 2023)",
        "section_rule": "Section 4",
        "authority": "National Biodiversity Authority (NBA)",
        "official_url": "https://nbaindia.org/content/25/19/1/act.html",
        "title": "Prohibition on Transfer of Research Results Without Prior NBA Approval",
        "category": "biodiversity_abs",
        "content": (
            "Section 4 provides that no person shall, without previous approval of the National Biodiversity Authority, transfer the results "
            "of any research relating to any biological resources occurring in, or obtained from, India, to any person who is not a citizen of India "
            "or is a foreign body corporate.\n\n"
            "Key Relevance for Ayurvedic R&D:\n"
            "1. Collaborative research: Indian academic institutions or AYUSH startups collaborating with foreign pharmaceutical companies or universities "
            "must obtain NBA Form II approval before sharing extracts, formulation data, or bioassay results.\n"
            "2. Publication exemption: Publication of research papers in journals or seminars is exempted only if complying with Central Government guidelines."
        )
    },
    {
        "id": "IN-BDA-SEC-006",
        "jurisdiction": "India",
        "statute": "The Biological Diversity Act, 2002 (amended 2023)",
        "section_rule": "Section 6",
        "authority": "National Biodiversity Authority (NBA)",
        "official_url": "https://nbaindia.org/content/25/19/1/act.html",
        "title": "Mandatory NBA Approval for Application of Intellectual Property Rights",
        "category": "biodiversity_abs",
        "content": (
            "Section 6(1) states: 'No person shall apply for any intellectual property right, by whatever name called, in or outside India for "
            "any invention based on any research or information on a biological resource obtained from India without obtaining the previous "
            "approval of the National Biodiversity Authority before grant of such IPR.'\n\n"
            "Procedural Compliance:\n"
            "1. Indian Patent Filing Timing: In India, under Section 6(1A), an applicant may apply for a patent first, but must obtain approval of "
            "the NBA before the patent is granted / sealed by the Patent Office.\n"
            "2. International / Foreign Filing: If filing outside India (PCT, US, EPO), previous approval of the NBA is strictly required BEFORE filing "
            "the patent application abroad.\n"
            "3. Form: Filed via NBA Form I (Application for IPR).\n"
            "4. Benefit Sharing Agreement: NBA imposes Access and Benefit Sharing (ABS) conditions (royalty or upfront fee) prior to issuing no-objection."
        )
    },
    {
        "id": "IN-BDA-SEC-007",
        "jurisdiction": "India",
        "statute": "The Biological Diversity Act, 2002 (amended 2023)",
        "section_rule": "Section 7",
        "authority": "State Biodiversity Boards (SBB)",
        "official_url": "https://nbaindia.org/content/25/19/1/act.html",
        "title": "Prior Intimation to State Biodiversity Board for Commercial Utilization by Indian Entities",
        "category": "biodiversity_abs",
        "content": (
            "Section 7 dictates that no person who is a citizen of India or a body corporate registered in India shall obtain any biological "
            "resource for commercial utilization, or bio-survey and bio-utilization for commercial utilization except after giving prior intimation "
            "to the State Biodiversity Board (SBB) concerned.\n\n"
            "Scope of Commercial Utilization:\n"
            "Includes end-use of biological resources for commercial utilization such as drugs, industrial enzymes, food flavours, fragrance, "
            "cosmetics, emulsifiers, oleoresins, colors, and extracts."
        )
    },
    {
        "id": "IN-BDA-SEC-007-EXEMP",
        "jurisdiction": "India",
        "statute": "Biological Diversity (Amendment) Act, 2023",
        "section_rule": "Section 7 Proviso & Section 40",
        "authority": "National Biodiversity Authority / Ministry of Environment, Forest and Climate Change (MoEFCC)",
        "official_url": "https://egazette.gov.in/WriteReadData/2023/247844.pdf",
        "title": "Statutory Exemptions for Local Vaidyas, AYUSH Practitioners, and Cultivators",
        "category": "biodiversity_abs",
        "content": (
            "The 2023 Amendment to the Biological Diversity Act introduced vital relief for traditional Ayurvedic practitioners:\n"
            "1. Practitioners Exemption: Local people and communities of the area, including local vaidyas, hakims, and registered AYUSH practitioners "
            "practicing indigenous medicine, are exempted from the requirement of prior intimation to the State Biodiversity Board and payment of ABS fees.\n"
            "2. Cultivated Medicinal Plants Exemption: Access to cultivated biological resources (cultivated medicinal plants) is exempted from the ABS regime "
            "provided a certificate of origin / cultivation certificate is produced.\n"
            "3. Non-applicability to Big Pharma/MSMEs: This exemption applies to traditional practitioners and growers, NOT to commercial pharmaceutical companies "
            "manufacturing proprietary Ayurvedic drugs at scale."
        )
    },
    {
        "id": "IN-BDA-SEC-040-NTAC",
        "jurisdiction": "India",
        "statute": "The Biological Diversity Act, 2002",
        "section_rule": "Section 40 (NTAC List)",
        "authority": "Ministry of Environment, Forest and Climate Change (MoEFCC)",
        "official_url": "https://nbaindia.org/uploaded/pdf/Notification_of_Normally_Traded_Commidities.pdf",
        "title": "Normally Traded as Commodities (NTAC) Exemption from ABS",
        "category": "biodiversity_abs",
        "content": (
            "Under Section 40, the Central Government has notified hundreds of biological resources as 'Normally Traded as Commodities' (NTAC).\n\n"
            "Legal Meaning:\n"
            "1. Listed agricultural items, medicinal herbs, and plant parts (e.g., dry ginger, black pepper, clove sold as agricultural produce) "
            "are exempt from the provisions of the Biological Diversity Act.\n"
            "2. Critical Legal Caveat: NTAC exemption applies ONLY when the item is traded strictly as a commodity. If an Ayurvedic company buys "
            "an NTAC commodity and uses it for R&D, patent filing, or extraction for a novel proprietary formulation, the NTAC exemption ceases and "
            "NBA/SBB ABS requirements are triggered."
        )
    },
    {
        "id": "IN-BDA-RUL-2024-ABS",
        "jurisdiction": "India",
        "statute": "Biological Diversity Rules, 2024 / ABS Regulations",
        "section_rule": "Rules on Benefit Sharing (Form I, Regulation 3-4)",
        "authority": "National Biodiversity Authority (NBA)",
        "official_url": "https://nbaindia.org/content/19/16/1/guidelines.html",
        "title": "Calculation of Access and Benefit Sharing (ABS) Percentages",
        "category": "biodiversity_abs",
        "content": (
            "The official ABS regulations lay down the monetary benefit-sharing formula for commercial utilization of biological resources:\n"
            "1. Annual Gross Ex-Factory Sale Percentage:\n"
            "   - Up to INR 1 Crore: 0.1%\n"
            "   - INR 1 Crore to 3 Crores: 0.2%\n"
            "   - Above INR 3 Crores: 0.5%\n"
            "2. IPR Commercialization Royalty: When an applicant obtains an IPR (patent) based on biological resources and commercializes it:\n"
            "   - If the applicant licenses the IPR to a third party: 3.0% to 5.0% of the royalty received.\n"
            "   - If the applicant commercializes it themselves: 0.2% to 1.0% of gross ex-factory sale.\n"
            "3. Benefit Sharing proceeds are deposited in the National Biodiversity Fund and shared with local Biodiversity Management Committees (BMCs)."
        )
    },

    # ==========================================
    # 3. INDIA: DRUGS & COSMETICS ACT / RULES
    # ==========================================
    {
        "id": "IN-DCA-SEC-003A",
        "jurisdiction": "India",
        "statute": "The Drugs and Cosmetics Act, 1940",
        "section_rule": "Section 3(a)",
        "authority": "Ministry of AYUSH / Central Drugs Standard Control Organisation (CDSCO)",
        "official_url": "https://cdsco.gov.in/opencms/export/sites/CDSCO_WEB/Pdf-documents/acts_rules/Drugs_and_Cosmetics_Act_1940.pdf",
        "title": "Definition of Classical Ayurvedic, Siddha or Unani (ASU) Drug",
        "category": "drug_regulatory",
        "content": (
            "Section 3(a) defines an 'Ayurvedic, Siddha or Unani drug' as including all medicines intended for internal or external use for or in the "
            "diagnosis, treatment, mitigation or prevention of disease or disorder in human beings or animals, and manufactured exclusively in "
            "accordance with the formulae described in the authoritative books of Ayurvedic, Siddha and Unani Tibb systems of medicine, specified in "
            "the First Schedule.\n\n"
            "Key Consequences:\n"
            "1. Authoritative Texts: Must be cited in the 54 recognized classical Ayurvedic texts (e.g., Charaka Samhita, Sushruta Samhita, Astanga Hridaya, "
            "Sahasrayoga, Bhaishajya Ratnavali, Ayurvedic Pharmacopoeia of India).\n"
            "2. IP Posture: Zero patentability under Section 3(p) of Patents Act (prior art).\n"
            "3. Regulatory Burden: Exempt from new drug clinical trials; requires classical manufacturing license from State Licensing Authority (AYUSH)."
        )
    },
    {
        "id": "IN-DCA-SEC-003H",
        "jurisdiction": "India",
        "statute": "The Drugs and Cosmetics Act, 1940",
        "section_rule": "Section 3(h)",
        "authority": "Ministry of AYUSH / State AYUSH Licensing Authorities",
        "official_url": "https://cdsco.gov.in/opencms/export/sites/CDSCO_WEB/Pdf-documents/acts_rules/Drugs_and_Cosmetics_Act_1940.pdf",
        "title": "Definition of Patent or Proprietary (P&P) Medicine in ASU Systems",
        "category": "drug_regulatory",
        "content": (
            "Section 3(h)(i) defines 'patent or proprietary medicine' in relation to Ayurvedic systems as:\n"
            "'a drug which is a remedy or prescription presented in any form ready for use, internally or externally, for the treatment, mitigation "
            "or prevention of disease in human beings or animals, but which is not a medicine which is specified in the authoritative books of "
            "the First Schedule, yet manufactured using ingredients mentioned in the authoritative Ayurvedic texts.'\n\n"
            "Key Distinctions:\n"
            "1. Ingredients MUST still be recognized in the First Schedule texts, but the exact combination, ratio, or dosage form is proprietary.\n"
            "2. Regulatory Rule: Regulated under Rule 158B of Drugs & Cosmetics Rules 1945.\n"
            "3. IP Posture: Can be protected via Trademarks and Trade Secrets. Only eligible for a patent if non-obvious synergy is experimentally proven "
            "under Patents Act Section 3(e) and 3(p)."
        )
    },
    {
        "id": "IN-DCA-RUL-158B",
        "jurisdiction": "India",
        "statute": "The Drugs and Cosmetics Rules, 1945",
        "section_rule": "Rule 158B",
        "authority": "Ministry of AYUSH / State AYUSH Licensing Authorities",
        "official_url": "https://ayush.gov.in/docs/drugs-and-cosmetics-rules-1945.pdf",
        "title": "Licensing Requirements and Proof of Effectiveness for ASU Drugs",
        "category": "drug_regulatory",
        "content": (
            "Rule 158B categorizes Ayurvedic drugs for licensing purposes and sets evidentiary standards:\n"
            "Category A: Classical Ayurvedic formulations (First Schedule texts) — No safety or efficacy trial data required; textual reference sufficient.\n"
            "Category B: Patent or Proprietary (P&P) medicines containing ingredients cited in classical texts with identical indications — Safety data "
            "based on published textual authority.\n"
            "Category C: Modified dosage forms of classical medicines (e.g., tablet/capsule replacing kwath/asava) — Stability study and bioequivalence/safety "
            "evaluation required.\n"
            "Category D: Formulations with new indications, combinations, or altered ingredients — Evidence of safety and efficacy via pilot clinical trials "
            "as per AYUSH GCP guidelines required before State Licensing Authority issues manufacturing license."
        )
    },
    {
        "id": "IN-DCA-RUL-122E-PHYTO",
        "jurisdiction": "India",
        "statute": "The Drugs and Cosmetics Rules, 1945 (Amendment 2015)",
        "section_rule": "Rule 122E & Schedule Y / New Drugs Rules 2019",
        "authority": "Central Drugs Standard Control Organisation (CDSCO)",
        "official_url": "https://cdsco.gov.in/opencms/export/sites/CDSCO_WEB/Pdf-documents/biologicals/Phytopharmaceutical%20Regulations.pdf",
        "title": "Phytopharmaceutical Drugs Regulatory and IP Regime",
        "category": "drug_regulatory",
        "content": (
            "A 'Phytopharmaceutical drug' is defined as an advanced purified and standardized fraction with defined minimum four bioactive or "
            "phytochemical marker compounds of an extract of a medicinal plant or its part, for internal or external use on human beings or animals.\n\n"
            "Critical Regulatory & IP Differences from Classical Ayurveda:\n"
            "1. Approval Authority: Regulated by CDSCO (DCGI), NOT state AYUSH licensing authorities.\n"
            "2. Clinical Trial Requirement: Full scientific evaluation required: Phase I, Phase II, Phase III clinical trials, stability data, "
            "fingerprint profiling (HPLC/HPTLC/LC-MS), and toxicity studies.\n"
            "3. High IP/Patentability Potential: Because it involves a sophisticated, novel purification/fractionation process with isolated marker compounds, "
            "phytopharmaceuticals are the prime category for defensible patent claims (composition of matter + process) overcoming Section 3(p) objections.\n"
            "4. NBA ABS Trigger: Absolute requirement for prior NBA Form I approval under Section 6 of Biological Diversity Act."
        )
    },
    {
        "id": "IN-DCA-RUL-170-ADV",
        "jurisdiction": "India",
        "statute": "Drugs and Magic Remedies (Objectionable Advertisements) Act, 1954 & Allied Rules",
        "section_rule": "Section 3 & 4 of DMROA 1954",
        "authority": "Ministry of AYUSH / Central Drugs Standard Control Organisation",
        "official_url": "https://indiacode.nic.in/bitstream/123456789/1572/1/195421.pdf",
        "title": "Prohibition of Misleading Advertisements and False Cures in ASU Medicine",
        "category": "advertising_compliance",
        "content": (
            "The law strictly prohibits any advertisement of Ayurvedic drugs claiming diagnosis, cure, mitigation, treatment or prevention of any "
            "disease specified in the Schedule (including diabetes, cancer, blindness, heart diseases, kidney stone, sexual impotence, obesity).\n\n"
            "Commercial & Trademark Relevance:\n"
            "1. Trademark rejection: Trade marks or brand names that imply curative claims for scheduled diseases will be rejected under Section 9 of "
            "Trade Marks Act 1999 as deceptive.\n"
            "2. Consumer Protection Act 2019: Severe financial penalties and criminal liability for misleading health endorsements or unsubstantiated claims."
        )
    },

    # ==========================================
    # 4. INDIA: AYURVEDA AAHAR & COSMETICS
    # ==========================================
    {
        "id": "IN-FSSAI-AYU-001",
        "jurisdiction": "India",
        "statute": "Food Safety and Standards (Ayurveda Aahar) Regulations, 2022",
        "section_rule": "Regulations 3, 4 & Schedule A",
        "authority": "Food Safety and Standards Authority of India (FSSAI)",
        "official_url": "https://fssai.gov.in/upload/uploadfiles/files/Gazette_Notification_Ayurveda_Aahar_06_05_2022.pdf",
        "title": "Definition, Scope and Prohibitions for Ayurveda Aahar",
        "category": "food_safety",
        "content": (
            "'Ayurveda Aahar' means food prepared in accordance with the recipes or ingredients or processes described in the authoritative books of "
            "Ayurveda listed in Schedule A, but shall not include Ayurvedic drugs or proprietary Ayurvedic medicines.\n\n"
            "Key Legal Boundaries:\n"
            "1. Prohibited Additions: Must NOT contain synthetic vitamins, minerals, or amino acids. Only natural ingredients conforming to authoritative "
            "texts can be included.\n"
            "2. Medicinal Claim Ban: Ayurveda Aahar labels must NOT make disease treatment, prevention, or curative claims. May only claim health promotion, "
            "physiological wellness, or traditional dietary benefits.\n"
            "3. Mandatory Logo: Must display the dedicated FSSAI 'Ayurveda Aahar' green/brown logo.\n"
            "4. IP Strategy: Not patentable as a therapeutic agent (Sec 3(p) & 3(i)). Protection is primarily via Trade Marks, trade dress, and proprietary culinary processes."
        )
    },
    {
        "id": "IN-FSSAI-AYU-002",
        "jurisdiction": "India",
        "statute": "Food Safety and Standards (Ayurveda Aahar) Regulations, 2022",
        "section_rule": "Regulation 6 & 8",
        "authority": "Food Safety and Standards Authority of India (FSSAI)",
        "official_url": "https://fssai.gov.in/upload/uploadfiles/files/Gazette_Notification_Ayurveda_Aahar_06_05_2022.pdf",
        "title": "Prior Approval for Novel Formulations and Labelling Requirements",
        "category": "food_safety",
        "content": (
            "Regulation 8 establishes an Expert Committee under FSSAI and Ministry of AYUSH to evaluate new Ayurveda Aahar products.\n"
            "If an innovator creates a novel food product incorporating Ayurvedic botanicals not directly matching classical recipes:\n"
            "1. Prior approval of FSSAI is mandatory before manufacturing or marketing.\n"
            "2. Submissions must demonstrate historical safe dietary usage.\n"
            "3. Clear advisory warning labels: 'For dietary use only — not for medicinal use' and 'Not recommended for infants below 24 months'."
        )
    },
    {
        "id": "IN-COS-RUL-2020",
        "jurisdiction": "India",
        "statute": "The Cosmetics Rules, 2020 & Drugs and Cosmetics Act, 1940",
        "section_rule": "DCA Section 3(aaa) & Cosmetics Rules 2020",
        "authority": "Central Drugs Standard Control Organisation (CDSCO)",
        "official_url": "https://cdsco.gov.in/opencms/export/sites/CDSCO_WEB/Pdf-documents/cosmetics/CosmeticsRules2020.pdf",
        "title": "Regulatory Boundary: Ayurvedic Cosmetics vs. Ayurvedic Drugs",
        "category": "cosmetics",
        "content": (
            "Section 3(aaa) defines a cosmetic as any article intended to be rubbed, poured, sprinkled, or sprayed on, or introduced into, or "
            "otherwise applied to the human body for cleansing, beautifying, promoting attractiveness, or altering appearance.\n\n"
            "The Critical Ayurvedic Distinction:\n"
            "1. If an Ayurvedic formulation (e.g., Kumkumadi Tailam, Aloe Vera gel) is marketed solely to moisturize, cleanse, or beautify skin, "
            "it is regulated as a Cosmetic.\n"
            "2. If it claims to cure acne, eczema, psoriasis, or regrow hair, it crosses into an ASU Drug requiring a drug manufacturing license under Rule 154.\n"
            "3. IP Posture: Formulation compositions for cosmetics face heavy Section 3(p) objections; novel delivery systems (e.g., liposomes) or trademark branding "
            "are the primary viable IP routes."
        )
    },

    # ==========================================
    # 5. INDIA: GI, PLANT VARIETIES & TKDL
    # ==========================================
    {
        "id": "IN-GI-ACT-1999",
        "jurisdiction": "India",
        "statute": "Geographical Indications of Goods (Registration & Protection) Act, 1999",
        "section_rule": "Section 8, 9 & 11",
        "authority": "Geographical Indications Registry, Chennai (CGPDTM)",
        "official_url": "https://ipindia.gov.in/writereaddata/Portal/IPOAct/1_49_1_gi-act-1999.pdf",
        "title": "Protection of Ayurvedic Botanicals and Formulations under Geographical Indications",
        "category": "geographical_indications",
        "content": (
            "The GI Act provides community intellectual property rights identifying goods as originating in a specific geographical territory, "
            "where a given quality, reputation or other characteristic is essentially attributable to its geographical origin.\n\n"
            "Ayurvedic Applications:\n"
            "1. Registered Ayurvedic GIs: Navara Rice (medicinal rice used in Panchakarma), Alleppey Green Cardamom, Malabar Pepper, Erode Turmeric, "
            "Kandhamal Haldi, Nilambur Teak.\n"
            "2. Legal Exclusivity: Only authorized users registered under Section 17 can market their produce with the registered GI tag.\n"
            "3. Distinction from Patents: GI protects collective community heritage and regional reputation indefinitely (renewed every 10 years), "
            "preventing biopiracy and misleading origin labelling."
        )
    },
    {
        "id": "IN-PPVFR-ACT-2001",
        "jurisdiction": "India",
        "statute": "Protection of Plant Varieties and Farmers' Rights Act, 2001",
        "section_rule": "Section 28, 39 & 41",
        "authority": "Protection of Plant Varieties and Farmers' Rights Authority (PPV&FRA)",
        "official_url": "https://plantauthority.gov.in/sites/default/files/pvact.pdf",
        "title": "Breeder Rights, Farmers' Rights, and Benefit Sharing in Medicinal Plants",
        "category": "plant_varieties",
        "content": (
            "The PPV&FR Act provides sui generis IP protection for plant varieties:\n"
            "1. Distinctiveness, Uniformity, and Stability (DUS) Criteria: A cultivated medicinal plant variety (e.g., a high-yielding Ashwagandha or Senna strain) "
            "can be registered as a New Variety (15–18 years of exclusivity).\n"
            "2. Farmers' Rights (Section 39): Protects traditional cultivators' rights to save, use, sow, resow, exchange, or sell their farm-saved seed/propagules.\n"
            "3. Gene Fund Benefit Sharing (Section 41): When an Ayurvedic company utilizes a traditional medicinal plant variety bred or conserved by local farmers, "
            "the National Gene Fund collects benefit-sharing royalties for the local community."
        )
    },
    {
        "id": "IN-TKDL-PRIA-001",
        "jurisdiction": "India",
        "statute": "CSIR Traditional Knowledge Digital Library (TKDL) Prior Art Framework",
        "section_rule": "TKDL Institutional Database & Access Guidelines",
        "authority": "Council of Scientific and Industrial Research (CSIR) & Ministry of AYUSH",
        "official_url": "https://www.tkdl.res.in/",
        "title": "TKDL Prior Art Status and Defensive IPR Protection",
        "category": "traditional_knowledge",
        "content": (
            "The Traditional Knowledge Digital Library (TKDL) is India's pioneer defensive IPR tool against biopiracy:\n"
            "1. Scope: Contains digitized documentation of over 450,000 formulations from classical texts (Ayurveda, Unani, Siddha, Sowa-Rigpa) "
            "translated into 5 international languages (English, German, French, Japanese, Spanish) using Traditional Knowledge Resource Classification (TKRC).\n"
            "2. Patent Office Agreements: CSIR has signed Access Agreements with leading patent offices worldwide (USPTO, EPO, JPO, UK-IPO, IP Australia, CGPDTM).\n"
            "3. Legal Effect: Patent examiners globally check the TKDL during prior art search. If an applicant attempts to patent an Ayurvedic combination "
            "already cited in classical texts, the application is rejected for lack of novelty and inventive step."
        )
    },

    # ==========================================
    # 6. INTERNATIONAL TREATIES & ABS
    # ==========================================
    {
        "id": "INT-WIPO-GRATK-2024",
        "jurisdiction": "International",
        "statute": "WIPO Treaty on Intellectual Property, Genetic Resources and Associated Traditional Knowledge (2024)",
        "section_rule": "Articles 3, 4 & 5",
        "authority": "World Intellectual Property Organization (WIPO)",
        "official_url": "https://www.wipo.int/edocs/mdocs/tk/en/gratk_dc/gratk_dc_7.pdf",
        "title": "Mandatory Patent Disclosure of Genetic Resources and Traditional Knowledge",
        "category": "international_treaty",
        "content": (
            "Adopted in Geneva on May 24, 2024, this historic treaty establishes a new mandatory international disclosure standard:\n"
            "1. Mandatory Disclosure Obligation (Article 3): Where a claimed invention in a patent application is based on genetic resources "
            "(medicinal plants, biological materials) or associated traditional knowledge, the applicant MUST disclose:\n"
            "   (a) The country of origin of the genetic resources; or\n"
            "   (b) The indigenous peoples or local community who provided the associated traditional knowledge.\n"
            "2. Sanctions and Remedies (Article 5): Contracting parties must provide opportunities to rectify failures to disclose, but intentional "
            "fraudulent concealment can lead to revocation of the patent under domestic law.\n"
            "3. Global Impact for Ayurveda: Prevents misappropriation of Indian Ayurvedic knowledge in foreign patent offices; closes the historic loop "
            "between domestic Indian law (Sec 10(4)) and international patent systems."
        )
    },
    {
        "id": "INT-CBD-NAGOYA-2010",
        "jurisdiction": "International",
        "statute": "Nagoya Protocol on Access to Genetic Resources and the Fair and Equitable Sharing of Benefits (2010)",
        "section_rule": "Articles 5, 6, 7 & 15",
        "authority": "Secretariat of the Convention on Biological Diversity (CBD / UN Environment)",
        "official_url": "https://www.cbd.int/abs/text/",
        "title": "International Access and Benefit-Sharing (ABS) Framework",
        "category": "international_treaty",
        "content": (
            "The Nagoya Protocol implements the third objective of the Convention on Biological Diversity (CBD):\n"
            "1. Prior Informed Consent (PIC) (Article 6): Access to biological resources (e.g., harvesting Himalayan herbs) requires explicit PIC "
            "from the provider country's national authority.\n"
            "2. Mutually Agreed Terms (MAT) (Article 5): Commercial users must enter into legal contracts guaranteeing fair monetary and non-monetary "
            "benefit sharing with the source country.\n"
            "3. Compliance Checkpoints (Article 15 & 17): Contracting states (including European Union, UK, Japan) have domestic laws checking "
            "Internationally Recognized Certificates of Compliance (IRCC) at patent offices or regulatory filing stages. Importing Indian Ayurvedic "
            "extracts without NBA approval violates Nagoya Protocol compliance in destination countries."
        )
    },
    {
        "id": "INT-TRIPS-ART-027",
        "jurisdiction": "International",
        "statute": "WTO Agreement on Trade-Related Aspects of Intellectual Property Rights (TRIPS)",
        "section_rule": "Article 27.3(b)",
        "authority": "World Trade Organization (WTO)",
        "official_url": "https://www.wto.org/english/docs_e/legal_e/27-trips_04c_e.htm",
        "title": "Patentability of Biological Inventions and Plant Varieties",
        "category": "international_treaty",
        "content": (
            "TRIPS Article 27.3(b) allows member states to exclude from patentability 'plants and animals other than micro-organisms, and essentially "
            "biological processes for the production of plants or animals'.\n\n"
            "Key Relevance to Global AYUSH Trade:\n"
            "1. Sui Generis Requirement: Members must provide protection for plant varieties either by patents, by an effective sui generis system "
            "(such as India's PPV&FR Act), or by any combination thereof.\n"
            "2. Flexibility for India: Article 27 gives India the sovereign legal right to maintain Section 3(p) and exclude traditional formulations "
            "from patentability, resisting international pharmaceutical pressure to allow patents on known botanical remedies."
        )
    },
    {
        "id": "INT-PCT-DIR-001",
        "jurisdiction": "International",
        "statute": "Patent Cooperation Treaty (PCT) & Regulations",
        "section_rule": "PCT Rule 39 & Budapest Treaty on Microorganisms",
        "authority": "World Intellectual Property Organization (WIPO)",
        "official_url": "https://www.wipo.int/pct/en/texts/rules/r39.html",
        "title": "International Patent Search and Traditional Knowledge Prior Art",
        "category": "international_treaty",
        "content": (
            "When filing an international patent application under the Patent Cooperation Treaty (PCT) for an Ayurvedic derivative:\n"
            "1. International Searching Authorities (ISAs) search PCT Minimum Documentation, which now includes non-patent literature databases "
            "and traditional knowledge journals.\n"
            "2. If an Indian applicant files a PCT application claiming an invention based on an Indian biological resource, Section 6 of India's "
            "Biological Diversity Act mandates that NBA approval must be obtained BEFORE filing abroad or initiating the PCT international phase.\n"
            "3. Budapest Treaty Deposit: If the formulation utilizes novel microbial fermentations (e.g., specific Ayurvedic asava/arishta yeast strains), "
            "the biological strain must be deposited in an International Depository Authority (IDA) like MTCC Chandigarh."
        )
    }
]

def build_corpus():
    print(f"[*] Building SAKTI Authoritative Legal Corpus in {CORPUS_DIR}...")
    index_records = []
    
    for prov in PROVISIONS:
        file_path = CORPUS_DIR / f"{prov['id']}.json"
        with open(file_path, "w", encoding="utf-8") as f:
            json.dump(prov, f, indent=2, ensure_ascii=False)
            
        index_records.append({
            "id": prov["id"],
            "jurisdiction": prov["jurisdiction"],
            "statute": prov["statute"],
            "section_rule": prov["section_rule"],
            "title": prov["title"],
            "authority": prov["authority"],
            "category": prov["category"],
            "official_url": prov["official_url"],
            "file_name": f"{prov['id']}.json"
        })
        print(f"  [+] Wrote: {prov['id']} ({prov['jurisdiction']} - {prov['section_rule']})")
        
    # Write master index file
    index_file = CORPUS_DIR / "corpus_index.json"
    with open(index_file, "w", encoding="utf-8") as f:
        json.dump({
            "total_documents": len(index_records),
            "jurisdictions": {
                "India": sum(1 for r in index_records if r["jurisdiction"] == "India"),
                "International": sum(1 for r in index_records if r["jurisdiction"] == "International")
            },
            "documents": index_records
        }, f, indent=2, ensure_ascii=False)
        
    print(f"\n[OK] Successfully compiled {len(index_records)} authoritative provisions into {CORPUS_DIR}")
    print(f"[OK] Created master index: {index_file}")

if __name__ == "__main__":
    build_corpus()
