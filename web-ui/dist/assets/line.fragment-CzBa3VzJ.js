import{S as n}from"./index-C4yQa5kO.js";import"./clipPlaneFragment-CfcTD0fq.js";import"./logDepthDeclaration-DSyp0qYm.js";import"./logDepthFragment-CQvzDBC8.js";const e="linePixelShader",r=`#include<clipPlaneFragmentDeclaration>
uniform color: vec4f;
#include<logDepthDeclaration>
#define CUSTOM_FRAGMENT_DEFINITIONS
@fragment
fn main(input: FragmentInputs)->FragmentOutputs {
#define CUSTOM_FRAGMENT_MAIN_BEGIN
#include<logDepthFragment>
#include<clipPlaneFragment>
fragmentOutputs.color=uniforms.color;
#define CUSTOM_FRAGMENT_MAIN_END
}`;n.ShadersStoreWGSL[e]||(n.ShadersStoreWGSL[e]=r);const l={name:e,shader:r};export{l as linePixelShaderWGSL};
