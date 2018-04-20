#![feature(proc_macro, wasm_custom_section, wasm_import_module)]

extern crate wasm_bindgen;

use std::f32;

use wasm_bindgen::prelude::*;


#[wasm_bindgen]
extern {
    #[wasm_bindgen(js_namespace = console)]
    fn log(msg: &str);
}

// A macro to provide `println!(..)`-style syntax for `console.log` logging.
macro_rules! log {
    ($($t:tt)*) => (log(&format!($($t)*)))
}


#[derive(Clone, Copy, Debug, PartialEq)]
pub struct CoordinatePair {
    pub x: f32,
    pub y: f32,
    pub bulge: Option<f32>
}

impl CoordinatePair {
    pub fn straight(x: f32, y: f32) -> Self {
        CoordinatePair { x, y, bulge: None }
    }

    pub fn arc(x: f32, y: f32, bulge: f32) -> Self {
        CoordinatePair { x, y, bulge: Some(bulge) }
    }
}

#[wasm_bindgen]
#[derive(Clone, Debug, PartialEq)]
pub struct Glyph {
    polylines: Vec<Vec<CoordinatePair>>,
    data: Vec<f32>,
}

#[wasm_bindgen]
#[derive(Clone, Debug, PartialEq, Default)]
pub struct BoundingBox {
    pub x_min: f32,
    pub x_max: f32,
    pub y_min: f32,
    pub y_max: f32,
}

impl Glyph {
    pub fn new(polylines: Vec<Vec<CoordinatePair>>) -> Glyph { // TODO: Borrow polylines
        let count = polylines.iter().map(|v| v.len() * 3).sum();
		let mut data = Vec::with_capacity(count);
        for polyline in polylines.iter() {
            for pair in polyline {
                data.push(pair.x);
                data.push(pair.y);
                data.push(pair.bulge.unwrap_or(f32::NAN));
            }
        }
        Glyph { polylines, data }
    }

}

#[wasm_bindgen]
impl Glyph {
    /// Return the glyph polylines as a f32 array.
    pub fn data(&self) -> *const f32 {
        self.data.as_ptr()
    }

    pub fn count(&self) -> usize {
        self.data.len() / 3
    }

    /// Return the bounding box.
    pub fn bounding_box(&self) -> BoundingBox {
        let mut bbox = BoundingBox::default();
        for polyline in self.polylines.iter() {
            for cp in polyline.iter() {
                if cp.x < bbox.x_min {
                    bbox.x_min = cp.x;
                } else if cp.x > bbox.x_max {
                    bbox.x_max = cp.x;
                }
                if cp.y < bbox.y_min {
                    bbox.y_min = cp.y;
                } else if cp.y > bbox.y_max {
                    bbox.y_max = cp.y;
                }
            }
        }
        bbox
    }
}

#[wasm_bindgen]
pub struct Alphabet;

#[wasm_bindgen]
impl Alphabet {
    pub fn a() -> Glyph {
        log!("Creating glyph a...");
        Glyph::new(vec![
            vec![
                CoordinatePair::straight(0.0, 0.0),
                CoordinatePair::straight(3.0, 9.0),
                CoordinatePair::straight(6.0, 0.0),
            ],
            vec![
                CoordinatePair::straight(1.2, 3.6),
                CoordinatePair::straight(4.8, 3.6),
            ],
        ])
    }
}
