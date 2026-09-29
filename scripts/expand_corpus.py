"""
Corpus Expansion Script for SAKTI.
Expands the legal corpus from 29 to 62 high-value authoritative provisions
covering Patents, Trade Marks, Geographical Indications, Designs, Copyright,
Plant Varieties, Biodiversity/ABS, Drugs & AYUSH, Food & Cosmetics, TKDL,
Case Law, Pharmacopoeial Standards, and International Treaties.
"""

import json
from pathlib import Path
from backend.corpus_loader import CorpusDocument

CORPUS_DIR = Path(__file__).resolve().parent.parent / "data" / "corpus"
INDEX_FILE = CORPUS_DIR / "corpus_index.json"

NEW_PROVISIONS = [
    # -------------------------------------------------------------
    # 1. PATENTS (Additional Provisions)
    # -------------------------------------------------------------
    {
        "id": "IN-PAT-SEC-039",
        "jurisdiction": "India",
        "statute": "The Patents Act, 1970 (as amended)",
        "section_rule": "Section 39",
        "authority": "Office of the Controller General of Patents, Designs and Trade Marks (CGPDTM / IP India)",
        "official_url": "https://ipindia.gov.in/acts/patent-act-1970",
        "title": "Residents Not to Apply for Patents Outside India Without Prior Permission",
        "category": "patents",
        "source_type": "statute",
        "effective_date": "1972-04-20 (amended 2005)",
        "last_verified": "2026-09-29",
        "content": "Section 39 of the Patents Act, 1970 mandates that no person resident in India shall apply for the grant of a patent outside India for an invention without either: (a) obtaining written permission (Foreign Filing License - FFL) from the Controller; or (b) having filed a patent application for the same invention in India not less than six weeks before the foreign application, provided no secrecy direction under Section 35 has been given.\n\nKey Legal Implications for Ayurvedic Inventions:\n1. Indian researchers, institutes, and enterprises developing Ayurvedic drug formulations or isolation methods must observe Section 39 before filing PCT or direct foreign patent applications abroad.\n2. Non-compliance is a criminal offense under Section 118 (imprisonment up to two years, fine, or both) and constitutes ground for patent revocation in India under Section 64(1)(n).\n3. Section 39 applies conditionally based on residency in India at the time the invention was made."
    },
    {
        "id": "IN-PAT-SEC-008",
        "jurisdiction": "India",
        "statute": "The Patents Act, 1970 (as amended)",
        "section_rule": "Section 8 & Rule 12",
        "authority": "Office of the Controller General of Patents, Designs and Trade Marks (CGPDTM / IP India)",
        "official_url": "https://ipindia.gov.in/acts/patent-act-1970",
        "title": "Information and Undertaking Regarding Foreign Applications (Form 3)",
        "category": "patents",
        "source_type": "statute",
        "effective_date": "1972-04-20 (amended 2024)",
        "last_verified": "2026-09-29",
        "content": "Section 8 of the Patents Act, 1970, read with Rule 12 of the Patents Rules, 2003 (as amended in 2024), requires patent applicants to disclose details of all corresponding foreign patent applications filed in other jurisdictions.\n\nKey Legal Implications for Ayurveda:\n1. When an applicant files patent applications for an herbal or Ayurvedic formulation across multiple national or regional offices (e.g., USPTO, EPO, JPO, PCT), an updated Form 3 statement must be submitted to the Indian Patent Office.\n2. The 2024 Patent Amendment Rules streamlined Section 8 compliance by requiring the Controller to access foreign prosecution history via public databases, while maintaining the applicant's continuing obligation to provide specified search and examination reports upon requisition.\n3. Willful failure to disclose foreign prosecution history or furnishing false information constitutes grounds for pre-grant or post-grant opposition under Section 25 and revocation under Section 64(1)(m)."
    },
    {
        "id": "IN-PAT-SEC-002-1J",
        "jurisdiction": "India",
        "statute": "The Patents Act, 1970 (as amended)",
        "section_rule": "Section 2(1)(j) & Section 2(1)(ja)",
        "authority": "Office of the Controller General of Patents, Designs and Trade Marks (CGPDTM / IP India)",
        "official_url": "https://ipindia.gov.in/acts/patent-act-1970",
        "title": "Definitions of Invention and Inventive Step",
        "category": "patents",
        "source_type": "statute",
        "effective_date": "2003-05-20 (amended 2005)",
        "last_verified": "2026-09-29",
        "content": "Section 2(1)(j) defines an 'invention' as a new product or process involving an inventive step and capable of industrial application. Section 2(1)(ja) defines 'inventive step' as a feature of an invention that involves technical advance as compared to the existing knowledge or having economic significance or both and that makes the invention not obvious to a person skilled in the art.\n\nKey Legal Implications for Ayurvedic Formulations:\n1. Novelty test: An Ayurvedic preparation is anticipated and lacks novelty if its formula, therapeutic usage, or method of preparation is disclosed in classical Ayurvedic treatises or indexed in the Traditional Knowledge Digital Library (TKDL).\n2. Inventive step test: Mere isolation of known phytochemicals or simple combinations of herbs disclosed in the Ayurvedic Pharmacopoeia fails the non-obviousness test unless significant, non-obvious technical synergy or unexpected biological activity is established by comparative data."
    },
    {
        "id": "IN-PAT-SEC-003C",
        "jurisdiction": "India",
        "statute": "The Patents Act, 1970 (as amended)",
        "section_rule": "Section 3(c)",
        "authority": "Office of the Controller General of Patents, Designs and Trade Marks (CGPDTM / IP India)",
        "official_url": "https://ipindia.gov.in/acts/patent-act-1970",
        "title": "Exclusion of Discovery of Living Things or Naturally Occurring Substances",
        "category": "patents",
        "source_type": "statute",
        "effective_date": "2003-05-20",
        "last_verified": "2026-09-29",
        "content": "Section 3(c) of the Patents Act, 1970 provides that 'the mere discovery of a scientific principle or the formulation of an abstract theory or discovery of any living thing or non-living substance occurring in nature' is not patentable subject matter.\n\nKey Legal Implications for Ayurveda & Botanical Research:\n1. Naturally occurring medicinal plants, raw herbs, unmodified plant extracts, wild botanical specimens, or naturally occurring microbial endophytes cannot be patented as products per se.\n2. Pure isolation of an unmodified compound existing in nature (e.g., extracting native curcumin directly from Curcuma longa or withanolides from Withania somnifera) without structural or synthetic modification faces statutory objection under Section 3(c).\n3. Patentable subject matter requires substantial human intervention, chemical synthesis of novel derivatives, or non-obvious modified molecular scaffolds possessing distinct technical characteristics."
    },

    # -------------------------------------------------------------
    # 2. TRADE MARKS (Ayurveda Brand & Product Protection)
    # -------------------------------------------------------------
    {
        "id": "IN-TM-ACT-SEC-009",
        "jurisdiction": "India",
        "statute": "The Trade Marks Act, 1999",
        "section_rule": "Section 9",
        "authority": "Trade Marks Registry (CGPDTM / IP India)",
        "official_url": "https://www.wipo.int/wipolex/en/legislation/details/2135",
        "title": "Absolute Grounds for Refusal of Trade Mark Registration",
        "category": "trademarks",
        "source_type": "statute",
        "effective_date": "2003-09-15",
        "last_verified": "2026-09-29",
        "content": "Section 9 of the Trade Marks Act, 1999 establishes absolute grounds for refusal of trade mark registration. In particular, marks that: (a) lack distinctive character; (b) consist exclusively of marks or indications designating the kind, quality, intended purpose, values, or geographical origin of the goods; or (c) consist exclusively of marks customary in the current language or bona fide established practices of the trade, shall not be registered.\n\nKey Legal Implications for Ayurvedic Products:\n1. Generic botanical and Sanskrit names of herbs (e.g., 'Ashwagandha', 'Triphala', 'Brahmi', 'Chyawanprash', 'Neem') cannot be registered as individual trade marks by any single commercial manufacturer.\n2. Descriptive terms indicating medicinal efficacy or therapeutic qualities (e.g., 'Ayur Cure', 'Pure Liver Tonic') face absolute refusal unless long, continuous, and exclusive commercial use establishing secondary meaning can be proven.\n3. Brand owners must adopt fanciful, arbitrary, or coined marks (e.g., unique brand prefixes combined with distinct logos) to secure robust trade mark protection for Ayurvedic formulations."
    },
    {
        "id": "IN-TM-ACT-SEC-011",
        "jurisdiction": "India",
        "statute": "The Trade Marks Act, 1999",
        "section_rule": "Section 11",
        "authority": "Trade Marks Registry (CGPDTM / IP India)",
        "official_url": "https://www.wipo.int/wipolex/en/legislation/details/2135",
        "title": "Relative Grounds for Refusal of Trade Mark Registration",
        "category": "trademarks",
        "source_type": "statute",
        "effective_date": "2003-09-15",
        "last_verified": "2026-09-29",
        "content": "Section 11 of the Trade Marks Act, 1999 prohibits the registration of a trade mark if: (a) its identity or similarity to an earlier trade mark and the identity or similarity of goods/services causes a likelihood of confusion or association among the public; or (b) it is identical or similar to an earlier well-known trade mark in India.\n\nKey Legal Implications for Ayurveda & Pharmaceuticals:\n1. In Cadila Health Care Ltd. v. Cadila Pharmaceuticals Ltd. (2001), the Supreme Court emphasized that a stricter standard of confusing similarity must be applied to medicinal and pharmaceutical products to prevent consumer confusion that could endanger health.\n2. For Ayurvedic medicines, phonetic, visual, and conceptual similarities with registered Ayurvedic or allopathic brand names in Class 5 (pharmaceuticals/herbal medicines) or Class 3 (herbal cosmetics) are rigorously examined by the Trade Marks Registry.\n3. Prior trade mark search across the official IP India Trade Marks Journal is essential before launching commercial Ayurvedic branding."
    },
    {
        "id": "IN-TM-ACT-SEC-029",
        "jurisdiction": "India",
        "statute": "The Trade Marks Act, 1999",
        "section_rule": "Section 27 & Section 29",
        "authority": "Trade Marks Registry (CGPDTM / IP India)",
        "official_url": "https://www.wipo.int/wipolex/en/legislation/details/2135",
        "title": "Infringement of Registered Trade Marks and Common Law Passing Off",
        "category": "trademarks",
        "source_type": "statute",
        "effective_date": "2003-09-15",
        "last_verified": "2026-09-29",
        "content": "Section 29 of the Trade Marks Act, 1999 defines trade mark infringement as the unauthorized use in trade of an identical or deceptively similar mark for identical or similar goods. Section 27 preserves the common law tort of 'passing off', allowing un-registered trade mark owners with established commercial goodwill to prevent deceptively similar misrepresentations.\n\nKey Legal Implications for Ayurvedic Manufacturers:\n1. Ayurvedic enterprises possessing registered trade marks can initiate statutory infringement lawsuits in District Courts or High Courts, seeking permanent injunctions, damages, or account of profits.\n2. Where a product brand is un-registered, a passing off suit under Section 27(2) requires establishing: (a) commercial goodwill/reputation, (b) misrepresentation by the competitor, and (c) actual or probable likelihood of damage.\n3. Copying distinct trade dress, packaging color schemes, or herbal layout motifs on Ayurvedic bottles and boxes provides grounds for passing off."
    },

    # -------------------------------------------------------------
    # 3. GEOGRAPHICAL INDICATIONS (GI Protection for Traditional Herbs & Regions)
    # -------------------------------------------------------------
    {
        "id": "IN-GI-ACT-SEC-020",
        "jurisdiction": "India",
        "statute": "The Geographical Indications of Goods (Registration and Protection) Act, 1999",
        "section_rule": "Section 20 & Section 21",
        "authority": "Geographical Indications Registry (CGPDTM / IP India)",
        "official_url": "https://ipindia.gov.in/page-content/geographical-indications-act-1999",
        "title": "Registration of Authorized Users and Exclusive Rights to Use Registered GI",
        "category": "geographical_indications",
        "source_type": "statute",
        "effective_date": "2003-09-15",
        "last_verified": "2026-09-29",
        "content": "Section 20 and 21 of the Geographical Indications of Goods Act, 1999 provide that registration of a geographical indication grants the registered proprietor and authorized users the exclusive right to use the GI in relation to the designated goods, and the right to obtain relief against infringement.\n\nKey Legal Implications for Ayurvedic Products & Cultivators:\n1. Renowned regional Ayurvedic botanicals and traditional medicinal goods (e.g., Malabar Pepper, Alleppey Green Cardamom, Coorg Cardamom, Navara Rice) are registered GIs in India.\n2. Any Ayurvedic cultivator, producer, or manufacturer operating in the demarcated geographical territory must apply to the GI Registry as an 'Authorized User' (Form GI-3) to legally affix the official GI logo on commercial products.\n3. Registered GIs cannot be assigned, transferred, licensed, or subjected to mortgage under Section 24, preserving collective heritage rights."
    },
    {
        "id": "IN-GI-ACT-SEC-022",
        "jurisdiction": "India",
        "statute": "The Geographical Indications of Goods (Registration and Protection) Act, 1999",
        "section_rule": "Section 22",
        "authority": "Geographical Indications Registry (CGPDTM / IP India)",
        "official_url": "https://ipindia.gov.in/page-content/geographical-indications-act-1999",
        "title": "Infringement of Registered Geographical Indications",
        "category": "geographical_indications",
        "source_type": "statute",
        "effective_date": "2003-09-15",
        "last_verified": "2026-09-29",
        "content": "Section 22 of the Geographical Indications of Goods Act, 1999 defines infringement of a registered GI. A registered GI is infringed by any person who, not being an authorized user, uses the GI in trade designations, advertising, or packaging that misleads the public as to the true geographical origin of the goods, or constitutes an act of unfair competition.\n\nKey Legal Implications for Traditional Medicine:\n1. Marketing an Ayurvedic remedy using protected GI appellations (e.g., claiming ingredients originate from 'Malabar' or 'Kashmir' when cultivated elsewhere) constitutes statutory GI infringement.\n2. Use of terms such as 'style', 'type', 'kind', or 'imitation' combined with a registered GI is strictly prohibited under Section 22(1)(b).\n3. Remedies include civil injunctions, damages, seizure/destruction of infringing goods, and criminal penalties under Section 38 (imprisonment from six months to three years and fine)."
    },

    # -------------------------------------------------------------
    # 4. DESIGNS (Packaging & Novel Forms for Herbal Products)
    # -------------------------------------------------------------
    {
        "id": "IN-DES-ACT-SEC-004",
        "jurisdiction": "India",
        "statute": "The Designs Act, 2000",
        "section_rule": "Section 4 & Section 5",
        "authority": "Patent and Design Office (CGPDTM / IP India)",
        "official_url": "https://ipindia.gov.in/acts/designs-act-2000",
        "title": "Prohibition of Registration of Non-Novel or Scandalous Designs",
        "category": "designs",
        "source_type": "statute",
        "effective_date": "2001-05-11",
        "last_verified": "2026-09-29",
        "content": "Section 4 of the Designs Act, 2000 prohibits the registration of any design that: (a) is not new or original; (b) has been disclosed to the public anywhere in India or abroad prior to filing; (c) is not significantly distinguishable from known designs or combinations of known designs; or (d) comprises scandalous or obscene matter.\n\nKey Legal Implications for Ayurvedic Product Containers & Applicators:\n1. The aesthetic shape, configuration, surface ornamentation, or novel visual container design of an Ayurvedic bottle, herbal cosmetic jar, or innovative dry powder dispenser can be registered under the Designs Act (Class 09 of the Locarno Classification).\n2. Novelty requirement: The design must not have been previously published in printed catalogs, social media, or sold in the market prior to the application filing date.\n3. Registration grants initial exclusivity for 10 years, extendable to 15 years upon payment of renewal fees under Section 10."
    },
    {
        "id": "IN-DES-ACT-SEC-002D",
        "jurisdiction": "India",
        "statute": "The Designs Act, 2000",
        "section_rule": "Section 2(d) & Section 22",
        "authority": "Patent and Design Office (CGPDTM / IP India)",
        "official_url": "https://ipindia.gov.in/acts/designs-act-2000",
        "title": "Definition of Design, Exclusion of Functional Devices, and Piracy of Registered Design",
        "category": "designs",
        "source_type": "statute",
        "effective_date": "2001-05-11",
        "last_verified": "2026-09-29",
        "content": "Section 2(d) of the Designs Act, 2000 defines 'design' as features of shape, configuration, pattern, ornament, or composition of lines or colours applied to any article by an industrial process, which in the finished article appeal to and are judged solely by the eye. It expressly excludes any mode or principle of construction, or anything which is in substance a merely functional mechanical device.\n\nKey Legal Implications for Herbal Drug Delivery Systems:\n1. Functional mechanisms (e.g., the internal valve, piston, or spray pump mechanism of an herbal inhaler) cannot be protected as industrial designs; such functionality must seek patent protection.\n2. Only the aesthetic outer appearance and industrial styling appeal can be registered as a design.\n3. Section 22 provides statutory remedies for 'piracy of registered design', entitling the proprietor to recover statutory damages up to Rs. 50,000 per violation or file for an interlocutory injunction and full account of profits."
    },

    # -------------------------------------------------------------
    # 5. COPYRIGHT (Documentation, Texts, Herbaria, Databases)
    # -------------------------------------------------------------
    {
        "id": "IN-COP-ACT-SEC-013",
        "jurisdiction": "India",
        "statute": "The Copyright Act, 1957 (as amended)",
        "section_rule": "Section 13 & Section 14",
        "authority": "Copyright Office of India (DPIIT)",
        "official_url": "https://www.wipo.int/wipolex/en/legislation/details/2144",
        "title": "Works in Which Copyright Subsists and Exclusive Rights of Authors",
        "category": "copyright",
        "source_type": "statute",
        "effective_date": "1958-01-21 (amended 2012)",
        "last_verified": "2026-09-29",
        "content": "Section 13 of the Copyright Act, 1957 provides that copyright subsists in original literary, dramatic, musical, and artistic works, cinematograph films, and sound recordings. Section 14 enumerates the exclusive rights of the owner, including reproduction, publication, adaptation, and translation.\n\nKey Legal Implications for Traditional Medicine Knowledge & Compendia:\n1. Ancient classical Sanskrit verses and foundational treatises (e.g., Charaka Samhita, Sushruta Samhita, Ashtanga Hridaya) are in the public domain; their underlying ancient text cannot be monopolized by copyright.\n2. Modern scholarly commentaries, original English/vernacular translations, explanatory annotations, structured clinical dossiers, botanical drawings, and proprietary compilations of Ayurvedic formulation databases are original literary/artistic works entitled to copyright protection.\n3. Electronic database compilations (e.g., TKDL's curated classifications) enjoy protection as literary compilations under Section 2(o)."
    },
    {
        "id": "IN-COP-ACT-SEC-052",
        "jurisdiction": "India",
        "statute": "The Copyright Act, 1957 (as amended)",
        "section_rule": "Section 52(1)(a) & (q)",
        "authority": "Copyright Office of India (DPIIT)",
        "official_url": "https://www.wipo.int/wipolex/en/legislation/details/2144",
        "title": "Acts Not Constituting Infringement of Copyright (Fair Dealing)",
        "category": "copyright",
        "source_type": "statute",
        "effective_date": "1958-01-21 (amended 2012)",
        "last_verified": "2026-09-29",
        "content": "Section 52 of the Copyright Act, 1957 specifies acts that do not constitute an infringement of copyright. Under Section 52(1)(a), fair dealing with any work for private or personal use (including research), criticism, review, or reporting of current events does not infringe copyright. Section 52(1)(q) permits the reproduction or publication of any matter published in any Official Gazette or reports of government committees.\n\nKey Legal Implications for Ayurvedic Research & Prior Art Scrutiny:\n1. Patent examiners, researchers, and AYUSH scientists who cite, excerpt, or analyze copyrighted modern botanical papers, clinical trial results, or pharmacognosy texts for verifying prior art or non-obviousness are protected under fair dealing.\n2. Government pharmacopoeial monographs (e.g., Ayurvedic Pharmacopoeia of India) published under the Drugs and Cosmetics Act can be referenced and cited freely for statutory compliance."
    },

    # -------------------------------------------------------------
    # 6. PLANT VARIETY PROTECTION (PPVFR - Farmers & Breeders Rights)
    # -------------------------------------------------------------
    {
        "id": "IN-PPVFR-ACT-SEC-015",
        "jurisdiction": "India",
        "statute": "Protection of Plant Varieties and Farmers' Rights Act, 2001",
        "section_rule": "Section 15",
        "authority": "Protection of Plant Varieties and Farmers' Rights Authority (PPV&FRA)",
        "official_url": "https://www.wipo.int/wipolex/en/legislation/details/2130",
        "title": "Criteria for Registration of Plant Varieties (DUS Test)",
        "category": "plant_varieties",
        "source_type": "statute",
        "effective_date": "2005-10-19",
        "last_verified": "2026-09-29",
        "content": "Section 15 of the Protection of Plant Varieties and Farmers' Rights Act, 2001 specifies the criteria for registration of a plant variety. A new variety is registrable if it conforms to the criteria of: (a) Novelty, (b) Distinctiveness (clearly distinguishable by at least one essential characteristic), (c) Uniformity, and (d) Stability (essential characteristics remain unchanged after repeated propagation) — known as DUS testing.\n\nKey Legal Implications for Cultivated Medicinal Plants:\n1. Agronomic researchers developing improved cultivars of medicinal plants (e.g., high-yield Ashwagandha - Withania somnifera, high-sennoside Senna, or high-artemisinin Artemisia) can obtain plant breeder certificates under the PPVFR Act.\n2. Wild medicinal plant varieties growing naturally in forests cannot be registered as 'new varieties' by commercial breeders without recognizing community origins.\n3. The certificate grants exclusive rights to produce, sell, market, distribute, import, or export the propagating material for 15 to 18 years depending on plant category."
    },
    {
        "id": "IN-PPVFR-ACT-SEC-039-FAR",
        "jurisdiction": "India",
        "statute": "Protection of Plant Varieties and Farmers' Rights Act, 2001",
        "section_rule": "Section 39(1)(iv) & Section 41",
        "authority": "Protection of Plant Varieties and Farmers' Rights Authority (PPV&FRA)",
        "official_url": "https://www.wipo.int/wipolex/en/legislation/details/2130",
        "title": "Farmers' Rights and Protection of Traditional Rural/Tribal Varieties",
        "category": "plant_varieties",
        "source_type": "statute",
        "effective_date": "2005-10-19",
        "last_verified": "2026-09-29",
        "content": "Section 39(1)(iv) of the PPVFR Act, 2001 is a sui generis legal protection ensuring that a farmer is entitled to save, use, sow, resow, exchange, share, or sell his farm produce including seed of a variety protected under this Act, provided the farmer does not sell branded seed. Section 41 recognizes the rights of tribal and village communities that have contributed to the preservation and development of traditional plant varieties.\n\nKey Legal Implications for Ayurvedic Sourcing:\n1. Farmers conserving traditional landraces of medicinal herbs cannot be sued for plant breeder infringement for saving and replanting traditional seeds.\n2. Where commercial Ayurvedic drug manufacturers source raw botanicals derived from traditional landraces developed by local communities, claims for benefit sharing can be filed with the National Gene Fund under Section 41.\n3. Plant breeders seeking registration of varieties derived from farmers' varieties must disclose parental origin under Section 18(1)(e)."
    },

    # -------------------------------------------------------------
    # 7. BIOLOGICAL DIVERSITY / ABS (Compliance, Approvals, & 2024 Rules)
    # -------------------------------------------------------------
    {
        "id": "IN-BDA-SEC-019",
        "jurisdiction": "India",
        "statute": "The Biological Diversity Act, 2002 (as amended 2023)",
        "section_rule": "Section 19",
        "authority": "National Biodiversity Authority (NBA)",
        "official_url": "https://nbaindia.org/content/25/19/1/act.html",
        "title": "Application for Access to Biological Resources and Commercial Utilization",
        "category": "biodiversity",
        "source_type": "statute",
        "effective_date": "2003-02-05 (amended 2023)",
        "last_verified": "2026-09-29",
        "content": "Section 19 of the Biological Diversity Act, 2002 governs applications to the National Biodiversity Authority (NBA) for obtaining biological resources or knowledge associated thereto for commercial utilization, bio-survey, or bio-utilization by persons or entities covered under Section 3(2) (non-Indian citizens, foreign companies, or Indian companies with foreign shareholding).\n\nKey Legal Implications for Ayurvedic Drug Development:\n1. Foreign pharmaceutical enterprises, multinational cosmetic corporations, or Indian firms with foreign investment must submit Form I to the NBA prior to acquiring any Indian medicinal botanical resource for commercial drug manufacturing.\n2. NBA reviews applications in consultation with local Biodiversity Management Committees (BMCs) and imposes mutually agreed terms (MAT) and Fair and Equitable Benefit Sharing (FEBS) percentages.\n3. Commercial access without NBA approval under Section 19 attracts civil and statutory enforcement penalties under Section 55."
    },
    {
        "id": "IN-BDA-SEC-020",
        "jurisdiction": "India",
        "statute": "The Biological Diversity Act, 2002 (as amended 2023)",
        "section_rule": "Section 20",
        "authority": "National Biodiversity Authority (NBA)",
        "official_url": "https://nbaindia.org/content/25/19/1/act.html",
        "title": "Transfer of Biological Resource or Knowledge Associated Thereto",
        "category": "biodiversity",
        "source_type": "statute",
        "effective_date": "2003-02-05 (amended 2023)",
        "last_verified": "2026-09-29",
        "content": "Section 20 of the Biological Diversity Act, 2002 prohibits any person who has been granted approval under Section 19 from transferring the accessed biological resource or knowledge associated thereto to any third party without obtaining prior written approval of the National Biodiversity Authority.\n\nKey Legal Implications for Collaborative Herbal R&D:\n1. Where an Ayurvedic research institute or biotechnology company accesses biological materials or traditional knowledge and subsequently enters into a technology transfer, licensing, or commercial out-licensing agreement with an international partner, prior approval under Form II is mandatory.\n2. Collaborative research projects conforming to Central Government guidelines and approved by designated ministries are exempted under Section 5.\n3. Unauthorized transfer of genetic resources or Ayurvedic formulations across borders breaches both Section 20 and the Nagoya Protocol framework."
    },
    {
        "id": "IN-BDA-SEC-021",
        "jurisdiction": "India",
        "statute": "The Biological Diversity Act, 2002 (as amended 2023)",
        "section_rule": "Section 21 & Section 21A",
        "authority": "National Biodiversity Authority (NBA)",
        "official_url": "https://nbaindia.org/content/25/19/1/act.html",
        "title": "Determination of Equitable Benefit Sharing and Recovery as Land Revenue",
        "category": "biodiversity",
        "source_type": "statute",
        "effective_date": "2003-02-05 (amended 2023)",
        "last_verified": "2026-09-29",
        "content": "Section 21 of the Biological Diversity Act, 2002 empowers the National Biodiversity Authority to determine fair and equitable benefit sharing arising out of the use of biological resources, commercial utilization, and intellectual property rights. Under Section 21A (inserted by the 2023 Amendment Act), orders of the NBA or State Biodiversity Boards determining benefit sharing or penalties are executable as decrees of a civil court, and unpaid dues may be recovered as arrears of land revenue.\n\nKey Legal Implications for Industry:\n1. Benefit sharing options include monetary payments (percentage of gross ex-factory sales: typically 0.1% to 0.5%), technology transfer, training, or deposit in the National Biodiversity Fund.\n2. Section 21A provides immediate executive enforceability against defaulting Ayurvedic manufacturers without requiring prolonged civil court trials."
    },
    {
        "id": "IN-BDA-SEC-024",
        "jurisdiction": "India",
        "statute": "The Biological Diversity Act, 2002 (as amended 2023)",
        "section_rule": "Section 24",
        "authority": "State Biodiversity Boards (SBB) & NBA",
        "official_url": "https://nbaindia.org/content/25/19/1/act.html",
        "title": "Prior Intimation to State Biodiversity Board by Indian Citizens and Commercial Entities",
        "category": "biodiversity",
        "source_type": "statute",
        "effective_date": "2003-02-05 (amended 2023)",
        "last_verified": "2026-09-29",
        "content": "Section 24 of the Biological Diversity Act, 2002 provides that any citizen of India or a body corporate registered in India seeking to obtain biological resources for commercial utilization must give prior intimation to the concerned State Biodiversity Board (SBB) in the prescribed format.\n\nKey Legal Implications for Domestic Ayurvedic Companies:\n1. Under the 2023 Amendment Act, codified traditional knowledge, registered AYUSH practitioners (Vaidyas, Hakims), and cultivated medicinal plants are expressly exempted from SBB intimation and benefit sharing requirements under Section 7 and 24.\n2. However, domestic commercial manufacturers sourcing wild-harvested herbs from forest areas for mass-scale proprietary drug production remain subject to SBB intimation and equitable benefit sharing levies."
    },
    {
        "id": "IN-BDA-RUL-2024-EXEMP",
        "jurisdiction": "India",
        "statute": "Guidelines on Access and Benefit Sharing Regulations, 2024",
        "section_rule": "Regulation 3 & Regulation 4 Exemptions",
        "authority": "National Biodiversity Authority (NBA)",
        "official_url": "https://nbaindia.org/content/19/16/1/guidelines.html",
        "title": "Statutory Exemptions from Benefit Sharing for Cultivated Plants and Codified Traditional Medicine",
        "category": "biodiversity",
        "source_type": "regulation",
        "effective_date": "2024-01-01",
        "last_verified": "2026-09-29",
        "content": "The Access and Benefit Sharing Guidelines and Regulations, 2024, in alignment with the Biological Diversity (Amendment) Act, 2023, codify explicit exemptions from benefit-sharing obligations.\n\nKey Statutory Exemptions:\n1. Cultivated Medicinal Plants: Commercial utilization of medicinal plants that are cultivated by farmers or gathered from private agricultural lands is exempted from ABS levies, provided a Certificate of Origin or cultivation certificate from local agricultural/horticultural authorities is maintained.\n2. Codified Traditional Knowledge: Classic Ayurvedic preparations manufactured strictly in accordance with recognized ancient classical texts listed in the First Schedule to the Drugs and Cosmetics Act are exempt from domestic SBB ABS levies.\n3. AYUSH Practitioners: Practicing Vaidyas, Siddha practitioners, and Unani Hakims preparing medicines for direct treatment of their individual patients are completely exempt from prior intimation or ABS payments."
    },

    # -------------------------------------------------------------
    # 8. DRUGS & AYUSH REGULATION (DCA, DTAB, GMP, Labelling)
    # -------------------------------------------------------------
    {
        "id": "IN-DCA-SEC-033D",
        "jurisdiction": "India",
        "statute": "The Drugs and Cosmetics Act, 1940",
        "section_rule": "Section 33D & Section 33E",
        "authority": "Central Drugs Standard Control Organisation (CDSCO) & Ministry of AYUSH",
        "official_url": "https://cdsco.gov.in/opencms/opencms/en/Acts-and-rules/Drugs-and-Cosmetics-Act/",
        "title": "Ayurvedic, Siddha and Unani Drugs Technical Advisory Board (ASU DTAB)",
        "category": "drugs_cosmetics",
        "source_type": "statute",
        "effective_date": "1964-06-10",
        "last_verified": "2026-09-29",
        "content": "Section 33D of the Drugs and Cosmetics Act, 1940 establishes the Ayurvedic, Siddha and Unani Drugs Technical Advisory Board (ASU DTAB) to advise the Central Government and State Governments on technical matters arising out of the administration of Chapter IVA of the Act.\n\nKey Legal Implications for the AYUSH Sector:\n1. ASU DTAB is the apex statutory advisory body for reviewing amendments to ASU Drug Rules, pharmacopoeial monographs, shelf-life norms, and clinical validation standards.\n2. Any proposed regulation affecting Ayurvedic patent or proprietary medicines, heavy metal permissible limits, or clinical safety trials must be referred to ASU DTAB before notification in the Gazette of India.\n3. Section 33E constitutes the Ayurvedic, Siddha and Unani Drugs Consultative Committee to ensure uniformity of administration across all State Licensing Authorities."
    },
    {
        "id": "IN-DCA-RUL-153",
        "jurisdiction": "India",
        "statute": "The Drugs Rules, 1945",
        "section_rule": "Rule 153 & Form 25D",
        "authority": "State Licensing Authority (AYUSH) & CDSCO",
        "official_url": "https://cdsco.gov.in/opencms/opencms/en/Acts-and-rules/Drugs-Rules/",
        "title": "Application and Grant of Manufacturing License for ASU Drugs",
        "category": "drugs_cosmetics",
        "source_type": "rule",
        "effective_date": "1945-12-21 (amended periodically)",
        "last_verified": "2026-09-29",
        "content": "Rule 153 of the Drugs Rules, 1945 specifies that an application for the grant or renewal of a license to manufacture for sale any Ayurvedic, Siddha, or Unani drug shall be made in Form 24D to the State Licensing Authority appointed by the State Government, and the license is issued in Form 25D.\n\nKey Legal Implications for Manufacturing Startups:\n1. A separate license is mandatory for classical Ayurvedic medicines versus patent or proprietary (P&P) Ayurvedic formulations.\n2. Pre-requisites include: compliance with Schedule T Good Manufacturing Practices (GMP), qualified technical staff holding a degree in Ayurveda/Pharmacy, and access to approved testing laboratory facilities.\n3. Selling or distributing Ayurvedic medicines manufactured in non-licensed premises constitutes an offense under Section 33-I, punishable with imprisonment."
    },
    {
        "id": "IN-DCA-SCH-T-GMP",
        "jurisdiction": "India",
        "statute": "The Drugs Rules, 1945",
        "section_rule": "Schedule T (Rule 157)",
        "authority": "State Licensing Authority (AYUSH) & CDSCO",
        "official_url": "https://cdsco.gov.in/opencms/opencms/en/Acts-and-rules/Drugs-Rules/",
        "title": "Good Manufacturing Practices (GMP) for Ayurvedic, Siddha and Unani Medicines",
        "category": "drugs_cosmetics",
        "source_type": "rule",
        "effective_date": "2000-06-23 (amended 2008)",
        "last_verified": "2026-09-29",
        "content": "Schedule T of the Drugs Rules, 1945 prescribes mandatory Good Manufacturing Practices (GMP) for factory premises, hygiene, raw materials, manufacturing operations, quality control, and batch records for Ayurvedic, Siddha, and Unani drugs.\n\nKey Regulatory Requirements:\n1. Infrastructure: Dedicated factory zones with specified minimum square footage for raw material storage, processing, packaging, and in-house quality control testing.\n2. Quality Control: Mandatory testing of raw botanical materials for identity, purity, foreign organic matter, microbial contamination, heavy metals (Lead, Cadmium, Mercury, Arsenic), pesticide residues, and aflatoxins.\n3. Standard Operating Procedures (SOPs): Master formula records and batch manufacturing records must be maintained and preserved for at least five years or one year after expiry."
    },
    {
        "id": "IN-DCA-RUL-161-LBL",
        "jurisdiction": "India",
        "statute": "The Drugs Rules, 1945",
        "section_rule": "Rule 161 & Rule 161A",
        "authority": "State Licensing Authority (AYUSH) & CDSCO",
        "official_url": "https://cdsco.gov.in/opencms/opencms/en/Acts-and-rules/Drugs-Rules/",
        "title": "Labelling, Packaging, and True List of Ingredients for ASU Medicines",
        "category": "drugs_cosmetics",
        "source_type": "rule",
        "effective_date": "1945-12-21 (amended periodically)",
        "last_verified": "2026-09-29",
        "content": "Rule 161 of the Drugs Rules, 1945 governs the labelling requirements for Ayurvedic, Siddha, and Unani drugs. It requires that every container and outer package carry: (a) name of the drug; (b) true list of all active ingredients with botanical names and quantities; (c) reference text for classical drugs; (d) manufacturing license number; (e) batch/lot number; (f) date of manufacture and date of expiry; (g) name and address of manufacturer; and (h) 'Ayurvedic Medicine' cautionary statement.\n\nKey Regulatory Implications:\n1. Patent and Proprietary medicines must disclose the complete formula on the label or package insert.\n2. Schedule E(1) poisonous plant ingredients (e.g., Bhang - Cannabis sativa, Vatsanabha - Aconitum ferox, Gunja - Abrus precatorius) must display a prominent warning: 'Caution: To be taken under medical supervision'.\n3. Non-compliant labelling renders the drug 'misbranded' under Section 33E."
    },

    # -------------------------------------------------------------
    # 9. FOOD & COSMETICS (Cosmetics Safety, FSSAI Standards)
    # -------------------------------------------------------------
    {
        "id": "IN-COS-RUL-039-SAFE",
        "jurisdiction": "India",
        "statute": "The Cosmetics Rules, 2020",
        "section_rule": "Rule 39 & Schedule S / Schedule Q",
        "authority": "Central Drugs Standard Control Organisation (CDSCO)",
        "official_url": "https://cdsco.gov.in/opencms/opencms/en/Acts-and-rules/Cosmetics-Rules/",
        "title": "Safety Standards, Heavy Metal Limits, and Animal Testing Ban for Herbal Cosmetics",
        "category": "food_cosmetics",
        "source_type": "rule",
        "effective_date": "2020-12-15",
        "last_verified": "2026-09-29",
        "content": "Rule 39 of the Cosmetics Rules, 2020 prohibits the manufacture or import of cosmetics containing ingredients not conforming to standards prescribed by the Bureau of Indian Standards (BIS) in Schedule S, or containing harmful heavy metals and prohibited colorants under Schedule Q. The Rules also strictly ban animal testing for cosmetics and ingredients.\n\nKey Regulatory Implications for Herbal Cosmetics:\n1. Herbal cosmetics (e.g., herbal face creams, hair oils, botanical cleansers) must comply with microbiological limits and heavy metal limits (Lead < 20 ppm, Arsenic < 2 ppm, Mercury < 1 ppm).\n2. Manufacturers cannot label a cosmetic with therapeutic or medicinal disease-cure claims; doing so converts the product into an unlicensed drug under the DCA.\n3. Every manufacturing unit must hold a cosmetic manufacturing license in Form COS-8 from the State Licensing Authority."
    },

    # -------------------------------------------------------------
    # 10. TRADITIONAL KNOWLEDGE / TKDL
    # -------------------------------------------------------------
    {
        "id": "IN-TKDL-ACC-AGREE",
        "jurisdiction": "India",
        "statute": "TKDL Institutional Database and International Patent Office Framework",
        "section_rule": "Access Agreement & Examination Guidelines",
        "authority": "Council of Scientific and Industrial Research (CSIR) & Ministry of AYUSH",
        "official_url": "https://www.wipo.int/en/web/traditional-knowledge",
        "title": "TKDL Access Agreement Framework for Global Patent Examination",
        "category": "traditional_knowledge",
        "source_type": "guideline",
        "effective_date": "2009-02-01 (expanded 2022)",
        "last_verified": "2026-09-29",
        "content": "The Traditional Knowledge Digital Library (TKDL) Access Agreement framework is a bilateral mechanism established by CSIR and the Government of India with major International Patent Offices (including EPO, USPTO, JPO, UKIPO, IP Australia, Rospatent, and CIPO). Under these agreements, patent examiners are granted confidential access to over 400,000 digitized Ayurvedic, Unani, and Siddha formulations.\n\nKey Legal Significance:\n1. Defensive Protection: Patent examiners conduct prior art searches in TKDL during prosecution, enabling immediate identification and rejection of patent claims attempting to monopolize known traditional knowledge under novelty or inventive step standards.\n2. Pre-Grant Interventions: CSIR monitors global patent publications and files third-party observations and pre-grant oppositions against misappropriation of Indian traditional medicinal formulations.\n3. In 2022, the Cabinet approved expanding TKDL access to private users, educational institutions, and R&D enterprises to foster innovation while preventing biopiracy."
    },

    # -------------------------------------------------------------
    # 11. CASE LAW / LANDMARK PRECEDENTS
    # -------------------------------------------------------------
    {
        "id": "IN-CASE-NOVARTIS-2013",
        "jurisdiction": "India",
        "statute": "The Patents Act, 1970 - Judicial Interpretation of Section 3(d)",
        "section_rule": "Novartis AG v. Union of India, (2013) 6 SCC 1",
        "authority": "Supreme Court of India",
        "official_url": "https://indiankanoon.org/doc/165776436/",
        "title": "Landmark Precedent on Enhanced Therapeutic Efficacy under Section 3(d)",
        "category": "case_law",
        "source_type": "judgment",
        "effective_date": "2013-04-01",
        "last_verified": "2026-09-29",
        "content": "In Novartis AG v. Union of India (2013), the Supreme Court of India rendered the definitive interpretation of Section 3(d) of the Patents Act, 1970. The Court held that for pharmaceutical and medicinal substances, 'efficacy' means 'therapeutic efficacy' — the capacity to produce a desired curative effect.\n\nKey Legal Principles for Ayurvedic & Phytochemical Inventions:\n1. Mere physical, polymorphic, or pharmacokinetic improvements (such as enhanced bioavailability, higher solubility, or better thermal stability) do not satisfy Section 3(d) unless they directly result in a proven enhancement in therapeutic curative efficacy.\n2. Inventions seeking patents on novel polymorphs, salts, or formulated extracts of known bioactive molecules (e.g., modified curcuminoids or withanolide salts) must present comparative clinical or in vivo pharmacological data showing superior therapeutic efficacy over the known base substance.\n3. The judgment provides patent examiners a strict precedent to reject attempts to extend patent terms on known natural or traditional therapeutic agents."
    },
    {
        "id": "IN-CASE-DIVYA-2018",
        "jurisdiction": "India",
        "statute": "The Biological Diversity Act, 2002 - Judicial Interpretation of Section 7 & 24",
        "section_rule": "Divya Pharmacy v. Union of India & Ors., WP (MS) No. 3437 of 2016",
        "authority": "High Court of Uttarakhand at Nainital",
        "official_url": "https://indiankanoon.org/doc/171507622/",
        "title": "Applicability of Fair and Equitable Benefit Sharing (FEBS) to Indian Commercial Entities",
        "category": "case_law",
        "source_type": "judgment",
        "effective_date": "2018-12-21",
        "last_verified": "2026-09-29",
        "content": "In Divya Pharmacy v. Union of India & Ors. (2018), the High Court of Uttarakhand addressed whether an Indian commercial entity (without foreign ownership) was liable to share benefits with local communities under the Biological Diversity Act, 2002 for commercial utilization of biological resources.\n\nKey Legal Principles:\n1. The High Court held that the obligation of Fair and Equitable Benefit Sharing (FEBS) under the Biological Diversity Act and the Nagoya Protocol applies equally to Indian commercial entities as well as foreign entities.\n2. SBB Powers Upheld: State Biodiversity Boards have statutory power to demand and determine benefit sharing from Indian companies utilizing biological resources sourced from indigenous lands.\n3. Purposive Interpretation: The Court ruled that biodiversity legislation must be interpreted purposively in harmony with international environmental treaties to protect traditional knowledge holders and tribal biodiversity conservators."
    },
    {
        "id": "IN-CASE-TURMERIC-CSIR",
        "jurisdiction": "India",
        "statute": "TKDL Historical Landmark Precedent on Traditional Knowledge Prior Art",
        "section_rule": "US Patent 5,401,504 Reexamination (CSIR Intervention)",
        "authority": "Office of the CGPDTM & Council of Scientific and Industrial Research (CSIR)",
        "official_url": "https://ipindia.gov.in/storage/uploads/docs-operator/220f0e1c-1301-4f0f-84a0-6709fa66c592.pdf",
        "title": "Landmark Revocation of US Patent on Use of Turmeric in Wound Healing",
        "category": "case_law",
        "source_type": "decision",
        "effective_date": "1997-08-23",
        "last_verified": "2026-09-29",
        "content": "In 1995, the USPTO granted US Patent 5,401,504 to the University of Mississippi Medical Center claiming the 'use of turmeric in wound healing'. In 1996, the Council of Scientific and Industrial Research (CSIR), India filed a formal reexamination petition challenging all patent claims on the grounds of lack of novelty and anticipation by Indian traditional knowledge.\n\nKey Legal Significance:\n1. Definitive Prior Art Evidence: CSIR submitted 32 documentary references, including ancient Ayurvedic classical texts (Bhavaprakasha, Charaka Samhita) and an official 1953 article published in the Indian Medical Association journal.\n2. Total Claim Cancellation: The USPTO upheld the reexamination challenge and revoked all claims of the patent in 1997, recognizing that the use of turmeric for healing wounds was documented ancient art in India.\n3. Institutional Catalyst: This historic victory was the direct catalyst for the Government of India creating the Traditional Knowledge Digital Library (TKDL) and incorporating Section 3(p) into the Patents Act, 1970."
    },

    # -------------------------------------------------------------
    # 12. PHARMACOPOEIAL STANDARDS
    # -------------------------------------------------------------
    {
        "id": "IN-API-PHARMA-STD",
        "jurisdiction": "India",
        "statute": "The Drugs and Cosmetics Act, 1940",
        "section_rule": "Section 3(a) & Second Schedule (Standard for ASU Drugs)",
        "authority": "Pharmacopoeia Commission for Indian Medicine & Homoeopathy (PCIM&H)",
        "official_url": "https://cdsco.gov.in/opencms/opencms/en/Acts-and-rules/Drugs-and-Cosmetics-Act/",
        "title": "Ayurvedic Pharmacopoeia of India (API) - Statutory Standards of Purity and Identity",
        "category": "standards",
        "source_type": "standard",
        "effective_date": "1989-01-01 (continually updated)",
        "last_verified": "2026-09-29",
        "content": "Under Section 3(a) and the Second Schedule of the Drugs and Cosmetics Act, 1940, the standards of identity, purity, and strength for Ayurvedic drugs are those prescribed in the Ayurvedic Pharmacopoeia of India (API) and the Ayurvedic Formulary of India (AFI), published by the Government of India.\n\nKey Legal Implications for Compliance:\n1. Statutory Benchmark: Any Ayurvedic drug manufactured or sold in India that fails to comply with the macroscopic, microscopic, chromatographic (TLC/HPTLC), or physico-chemical assay standards set out in the API monograph is legally deemed an 'adulterated' or 'not of standard quality' drug under Section 33EEA.\n2. Heavy Metal Tolerances: API establishes legal tolerance thresholds for total ash, acid-insoluble ash, alcohol-soluble extractive, microbial limits, and heavy metals.\n3. Court Admissibility: Government Analyst reports issued under Section 33F relying on API standards are conclusive statutory evidence in drug prosecution trials."
    },

    # -------------------------------------------------------------
    # 13. INTERNATIONAL LAYER (WIPO GRATK, CBD, TRIPS, PCT)
    # -------------------------------------------------------------
    {
        "id": "INT-WIPO-GRATK-ART-004",
        "jurisdiction": "International",
        "statute": "WIPO Treaty on Intellectual Property, Genetic Resources and Associated Traditional Knowledge (2024)",
        "section_rule": "Article 4 & Article 5",
        "authority": "World Intellectual Property Organization (WIPO)",
        "official_url": "https://www.wipo.int/edocs/mdocs/tk/en/gratk_dc/gratk_dc_7.pdf",
        "title": "Exceptions, Limitations, and Non-Retroactivity of Disclosure Obligations",
        "category": "international",
        "source_type": "treaty",
        "effective_date": "Adopted 2024-05-24 (Entry into force upon 15 ratifications)",
        "last_verified": "2026-09-29",
        "content": "Articles 4 and 5 of the WIPO GRATK Treaty (2024) define the scope, exceptions, and non-retroactive application of the mandatory patent disclosure requirement.\n\nKey Treaty Provisions:\n1. Non-Retroactivity (Article 5): Contracting Parties shall not impose the mandatory disclosure obligations of the Treaty on patent applications filed before the date of entry into force of the Treaty with respect to that Contracting Party.\n2. Scope of Exceptions (Article 4): Contracting Parties may adopt justified exceptions and limitations to the disclosure obligation in special cases, provided that such exceptions do not unjustifiably prejudice the implementation of the Treaty or mutual benefit sharing.\n3. Safeguards for Innovation: Ensures legal certainty for existing patent portfolios while establishing binding transparency for all future patent applications based on genetic resources and associated traditional knowledge."
    },
    {
        "id": "INT-CBD-ART-015",
        "jurisdiction": "International",
        "statute": "Convention on Biological Diversity (CBD, Rio 1992)",
        "section_rule": "Article 15",
        "authority": "Secretariat of the Convention on Biological Diversity (CBD)",
        "official_url": "https://www.cbd.int/convention/articles/?a=cbd-15",
        "title": "Access to Genetic Resources and Prior Informed Consent (PIC)",
        "category": "international",
        "source_type": "treaty",
        "effective_date": "1993-12-29",
        "last_verified": "2026-09-29",
        "content": "Article 15 of the Convention on Biological Diversity recognizes sovereign rights of States over their natural resources, establishing that national governments possess the authority to determine access to genetic resources subject to national legislation.\n\nKey International Principles:\n1. Sovereign Authority: Access to genetic resources shall only be granted upon Prior Informed Consent (PIC) of the Contracting Party providing such resources.\n2. Mutually Agreed Terms (MAT): Access, where granted, shall be on mutually agreed terms and subject to full legislative authorization.\n3. Fair and Equitable Sharing: Each Contracting Party shall take legislative, administrative, or policy measures with the aim of sharing in a fair and equitable way the results of research and development and the benefits arising from the commercial and other utilization of genetic resources."
    },
    {
        "id": "INT-PCT-RUL-051BIS",
        "jurisdiction": "International",
        "statute": "Patent Cooperation Treaty (PCT) Regulations",
        "section_rule": "Rule 51bis.1(g) & Rule 4.17",
        "authority": "World Intellectual Property Organization (WIPO)",
        "official_url": "https://www.wipo.int/pct/en/texts/rules/r51bis.html",
        "title": "National Requirements Concerning Declarations of Inventorship and Source of Biological Material",
        "category": "international",
        "source_type": "treaty_rule",
        "effective_date": "1970-06-19 (amended periodically)",
        "last_verified": "2026-09-29",
        "content": "Rule 51bis.1 of the Regulations under the Patent Cooperation Treaty (PCT) sets forth the permissible national requirements that a designated National Patent Office may require of an applicant during the national phase under Article 27 of the PCT.\n\nKey International Implications for Ayurvedic Patent Filings:\n1. Declarations of Source: National designated offices whose domestic laws require disclosure of the origin of genetic resources or traditional knowledge (e.g., India under Section 10(4)(d), Switzerland, Norway, Brazil) are authorized to demand compliance upon national phase entry.\n2. Standardization: Applicants may satisfy national phase formal requirements during international filing by including standardized declarations under Rule 4.17, preventing procedural rejections in designated states.\n3. Interoperability: Facilitates international patent filing while accommodating sovereign national biodiversity compliance mechanisms."
    }
]

def main():
    print(f"[*] Starting corpus expansion...")
    print(f"[*] Adding {len(NEW_PROVISIONS)} new authoritative provisions...")

    # Load existing corpus index
    if not INDEX_FILE.exists():
        raise FileNotFoundError(f"Corpus index not found at {INDEX_FILE}")

    index_data = json.loads(INDEX_FILE.read_text(encoding="utf-8"))
    existing_docs = index_data.get("documents", [])
    existing_ids = {d["id"] for d in existing_docs}

    added_count = 0
    updated_docs = list(existing_docs)

    for prov in NEW_PROVISIONS:
        doc_id = prov["id"]
        if doc_id in existing_ids:
            print(f"  [SKIP] {doc_id} already exists in corpus")
            continue

        # Validate with CorpusDocument Pydantic model
        validated_doc = CorpusDocument(**prov)

        # Write individual JSON file
        doc_filename = f"{doc_id}.json"
        doc_path = CORPUS_DIR / doc_filename
        doc_path.write_text(json.dumps(prov, indent=2, ensure_ascii=False), encoding="utf-8")

        # Create entry for corpus_index.json
        index_entry = {
            "id": prov["id"],
            "jurisdiction": prov["jurisdiction"],
            "statute": prov["statute"],
            "section_rule": prov["section_rule"],
            "title": prov["title"],
            "authority": prov["authority"],
            "category": prov["category"],
            "official_url": prov["official_url"],
            "file_name": doc_filename
        }
        updated_docs.append(index_entry)
        existing_ids.add(doc_id)
        added_count += 1
        print(f"  [ADDED] {doc_id} ({prov['jurisdiction']}) - {prov['title']}")

    # Calculate new totals
    total_docs = len(updated_docs)
    india_count = sum(1 for d in updated_docs if d["jurisdiction"].lower() == "india")
    intl_count = sum(1 for d in updated_docs if d["jurisdiction"].lower() == "international")

    new_index_data = {
        "total_documents": total_docs,
        "jurisdictions": {
            "India": india_count,
            "International": intl_count
        },
        "documents": updated_docs
    }

    INDEX_FILE.write_text(json.dumps(new_index_data, indent=2, ensure_ascii=False), encoding="utf-8")
    print(f"\n[OK] Successfully expanded corpus!")
    print(f"     Total provisions: {total_docs} (India: {india_count}, International: {intl_count})")
    print(f"     New entries added: {added_count}")

if __name__ == "__main__":
    main()
