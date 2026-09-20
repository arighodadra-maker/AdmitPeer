export type UniversityBrand = {
  bg:             string;
  text:           string;
  abbr:           string;
  domain:         string;
  faviconDomain?: string; // override when the .edu favicon isn't the recognizable logo
};

const BRANDS: Record<string, UniversityBrand> = {
  'Stanford University':                         { bg: '#8C1515', text: '#FFFFFF', abbr: 'SU',   domain: 'stanford.edu'       },
  'Harvard University':                          { bg: '#A51C30', text: '#FFFFFF', abbr: 'H',    domain: 'harvard.edu'        },
  'MIT':                                         { bg: '#A31F34', text: '#FFFFFF', abbr: 'MIT',  domain: 'mit.edu'            },
  'Yale University':                             { bg: '#00356B', text: '#FFFFFF', abbr: 'Y',    domain: 'yale.edu'           },
  'Princeton University':                        { bg: '#E77500', text: '#FFFFFF', abbr: 'P',    domain: 'princeton.edu'      },
  'Columbia University':                         { bg: '#003087', text: '#FFFFFF', abbr: 'CU',   domain: 'columbia.edu'       },
  'University of Pennsylvania':                  { bg: '#011F5B', text: '#FFFFFF', abbr: 'Penn', domain: 'upenn.edu'          },
  'Brown University':                            { bg: '#4E3629', text: '#FFFFFF', abbr: 'B',    domain: 'brown.edu'          },
  'Dartmouth College':                           { bg: '#00693E', text: '#FFFFFF', abbr: 'D',    domain: 'dartmouth.edu'      },
  'Cornell University':                          { bg: '#B31B1B', text: '#FFFFFF', abbr: 'C',    domain: 'cornell.edu'        },
  'Duke University':                             { bg: '#012169', text: '#FFFFFF', abbr: 'D',    domain: 'duke.edu',           faviconDomain: 'goduke.com'        },
  'Northwestern University':                     { bg: '#4E2A84', text: '#FFFFFF', abbr: 'NU',   domain: 'northwestern.edu'   },
  'Johns Hopkins University':                    { bg: '#002D72', text: '#FFFFFF', abbr: 'JHU',  domain: 'jhu.edu'            },
  'Georgetown University':                       { bg: '#041E42', text: '#FFFFFF', abbr: 'GU',   domain: 'georgetown.edu'     },
  'Rice University':                             { bg: '#002469', text: '#FFFFFF', abbr: 'R',    domain: 'rice.edu'           },
  'Vanderbilt University':                       { bg: '#866D4B', text: '#FFFFFF', abbr: 'VU',   domain: 'vanderbilt.edu'     },
  'University of Notre Dame':                    { bg: '#0C2340', text: '#C99700', abbr: 'ND',   domain: 'nd.edu'             },
  'Washington University in St. Louis':          { bg: '#A51417', text: '#FFFFFF', abbr: 'WU',   domain: 'wustl.edu'          },
  'New York University':                         { bg: '#57068C', text: '#FFFFFF', abbr: 'NYU',  domain: 'nyu.edu'            },
  'Tufts University':                            { bg: '#3E8EDE', text: '#FFFFFF', abbr: 'T',    domain: 'tufts.edu'          },
  'Emory University':                            { bg: '#012169', text: '#F2A900', abbr: 'EU',   domain: 'emory.edu'          },
  'Tulane University':                           { bg: '#006747', text: '#FFFFFF', abbr: 'TU',   domain: 'tulane.edu'         },
  'UC Berkeley':                                 { bg: '#003262', text: '#FDB515', abbr: 'UCB',  domain: 'berkeley.edu'       },
  'UCLA':                                        { bg: '#2D68C4', text: '#FFD100', abbr: 'UCLA', domain: 'ucla.edu'           },
  'UC San Diego':                                { bg: '#182B49', text: '#FFFFFF', abbr: 'UCSD', domain: 'ucsd.edu'           },
  'University of Michigan':                      { bg: '#00274C', text: '#FFCB05', abbr: 'UM',   domain: 'umich.edu'          },
  'University of Virginia':                      { bg: '#232D4B', text: '#E57200', abbr: 'UVA',  domain: 'virginia.edu'       },
  'University of North Carolina at Chapel Hill': { bg: '#4B9CD3', text: '#FFFFFF', abbr: 'UNC',  domain: 'unc.edu'            },
  'University of Wisconsin-Madison':             { bg: '#C5050C', text: '#FFFFFF', abbr: 'UW',   domain: 'wisc.edu'           },
  'University of Illinois Urbana-Champaign':     { bg: '#13294B', text: '#E84A27', abbr: 'UIUC', domain: 'illinois.edu'       },
  'University of Texas at Austin':               { bg: '#BF5700', text: '#FFFFFF', abbr: 'UT',   domain: 'utexas.edu'         },
  'University of Southern California':           { bg: '#990000', text: '#FFC72C', abbr: 'USC',  domain: 'usc.edu'            },
  'Georgia Institute of Technology':             { bg: '#003057', text: '#B3A369', abbr: 'GT',   domain: 'gatech.edu'         },
  'Northeastern University':                     { bg: '#C8102E', text: '#FFFFFF', abbr: 'NU',   domain: 'northeastern.edu'   },
  'Boston University':                           { bg: '#CC0000', text: '#FFFFFF', abbr: 'BU',   domain: 'bu.edu'             },
  'Boston College':                              { bg: '#8B0000', text: '#C9A227', abbr: 'BC',   domain: 'bc.edu'             },
  'Williams College':                            { bg: '#512888', text: '#FFFFFF', abbr: 'W',    domain: 'williams.edu'       },
  'Amherst College':                             { bg: '#3F1F69', text: '#FFFFFF', abbr: 'A',    domain: 'amherst.edu'        },
  'Middlebury College':                          { bg: '#00356B', text: '#FFFFFF', abbr: 'M',    domain: 'middlebury.edu'     },
  'Bowdoin College':                             { bg: '#1D1D1B', text: '#FFFFFF', abbr: 'B',    domain: 'bowdoin.edu'        },
  'Colby College':                               { bg: '#005CB9', text: '#FFFFFF', abbr: 'C',    domain: 'colby.edu'          },
  'Carnegie Mellon University':                  { bg: '#C41230', text: '#FFFFFF', abbr: 'CMU',  domain: 'cmu.edu'            },
  'Wake Forest University':                      { bg: '#9E7E38', text: '#FFFFFF', abbr: 'WF',   domain: 'wfu.edu'            },
  'Fordham University':                          { bg: '#00205B', text: '#FFFFFF', abbr: 'FU',   domain: 'fordham.edu'        },
  'George Washington University':                { bg: '#002654', text: '#FFFFFF', abbr: 'GWU',  domain: 'gwu.edu'            },
  'Case Western Reserve University':             { bg: '#003A70', text: '#FFFFFF', abbr: 'CWRU', domain: 'case.edu'           },
  'Villanova University':                        { bg: '#001069', text: '#FFFFFF', abbr: 'VU',   domain: 'villanova.edu'      },
  'Purdue University':                           { bg: '#8E6F3E', text: '#FFFFFF', abbr: 'PU',   domain: 'purdue.edu'         },
  'University of Florida':                       { bg: '#0021A5', text: '#FA4616', abbr: 'UF',   domain: 'ufl.edu'            },
  'Barnard College':                             { bg: '#003DA5', text: '#FFFFFF', abbr: 'BC',   domain: 'barnard.edu'        },
  'Davidson College':                            { bg: '#CC0000', text: '#FFFFFF', abbr: 'DC',   domain: 'davidson.edu'       },
  'University of Rochester':                     { bg: '#003580', text: '#FAC800', abbr: 'UR',   domain: 'rochester.edu'      },
};

const DEFAULT: UniversityBrand = { bg: '#4F46E5', text: '#FFFFFF', abbr: 'U', domain: '' };

export function getUniversityBrand(university: string): UniversityBrand {
  return BRANDS[university] ?? DEFAULT;
}
